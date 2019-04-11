const User = require('../models/user'),
      _Server = require('../models/server'),
      Room = require('../models/room'),
      RoomMessage = require('../models/roomMessage'),
      DirectMessage = require('../models/directMessage'),
      Dialog = require('../models/dialog'),
      config = require('../config'),
      errorMessages = require('../constants').errorMessages;

// const errorMessages = {
//   ServerError: 'Произошла ошибка на сервере.',
//   UserExist: 'Пользователь с таким username/email уже существует.',
//   ServerName: 'Сервер с таким именем уже существует.',
//   Forbidden: 'У вас недостаточно прав.',
//   AccessDenied: 'Доступ запрещен. Войдите в систему.',
//   ServerNotFound: 'Сервер не найден.',
//   UsernameEmailExist: 'Такой username/email уже занят.',
//   UserUnfound: 'Пользователь не найдет.',
//   DialogSaveError: 'Ошибка при сохранении диалога.',
//   DialogCreateError: 'Ошибка при создании диалога.',
//   DialogUnfound: 'Диалог не найден.',
//   InvalidIds: 'Неверный id пользователя и/или сервера.'
// }

module.exports.auth = async function(req, res) {
  try {
    const user = await User.findOne({email: req.body.email}).select('username email image');
    if (!user || !user.validPassword(req.body.password)) {
      return res.json({success: true, user: user, token: jwt.sign(JSON.stringify(user), config.JWT_KEY)});
    } else {
      return res.json({success: false, message: 'Неверный логин и/или пароль.'});
    }
  } catch (error) {
    console.log('/api/auth', error);
    return res.json({success: false, message: 'Ошибка на сервере.'});
  }
};

module.exports.register = async function(req, res) {
  try {
    const createdUser = await User({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password
    }).save();
    try {
      const [, servers] = await Promise.all([
        _Server.updateMany({}, { $push: { users: createdUser } }),
        _Server.find()
      ]);
      try {
        await User.findByIdAndUpdate(createdUser.id, { $push: { servers: { $each: servers } } });
        if (servers) {
          for (const server of servers) {
            io.toString(`Server-${server.id}`).emit('User_ConnectedToServer', {
              serverId: server.id,
              user: {
                _id: createdUser.id,
                username: createdUser.username,
                status: createdUser.status,
                image: createdUser.image
              }
            })
          }
        }
        return res.json({ success: true });
      } catch (error) {
        console.log('/api/register/ third try', error);
        return res.json({success: false, message: errorMessages.ServerError});
      }
    } catch (error) {
      console.log('/api/register/ second try', error);
      return res.json({success: false, message: errorMessages.ServerError});
    }
  } catch (error) {
    console.log('/api/register first try', error);
    return res.json({success: false, message: errorMessages.UserExist, logout: true});
  }
};

module.exports.create_server = async function(req, res) {
  try {
    const user = await User.findById(jwt.verify(req.body.token, config.JWT_KEY));
    if (user.isAdmin) {
      try {
        const [createdRoom, users] = await Promise.all([
          new Room({
            name: 'General',
            messages: [],
          }).save(),
          User.find().select('servers').exec()
        ]);
        try {
          const createdServer = await Server({
            name: req.body.serverName,
            users: users,
            rooms: [createdRoom]
          }).save();
          try {
            const serverFullInfo = await _Server.findById(createdServer.id)
              .select('users rooms blocked name image activeRoomId')
              .populate([
                {
                  path: 'users', select: 'username image status', model: 'user'
                },
                {
                  path: 'rooms', select: 'name messages typing', model: 'room',
                  populate: {
                    path: 'messages', model: 'roomMessage',
                    populate: {
                      path: 'author', select: 'username image status', model: 'user'
                    }
                  }
                }
              ]).exec();
            try {
              await User.updateMany({}, { $push: { servers: serverFullInfo } });
              for (const reciver of users) {
                io.to(`User-${reciver.id}`).emit('Server_ServerCreated', { server: serverFullInfo });
              }
              return res.json({success: true, serverName: serverFullInfo.name });
            } catch (error) {
              console.log('/api/create_server 5rd try', error);
              //return res.json({ success: false, message: 'Не удалось найти пользователя.'})
              return res.json({ success: false, message: errorMessages.ServerError})
            }
          } catch (error) {
            console.log('/api/create_server 4rd try', error);
            //return res.json({ success: false, message: 'Не удалось найти сервер.'})
            return res.json({ success: false, message: errorMessages.ServerError})
          }
          
        } catch (error) {
          console.log('/api/create_server third try', error);
          await createdRoom.remove();
          return res.json({ success: false, message: errorMessages.ServerName})
        }
      } catch (error) {
        console.log('/api/create_server second try', error);
        //return res.json({ success: false, message: 'Не удалось создать комнату.'})
        return res.json({ success: false, message: errorMessages.ServerError})
      }
    } else {
      if (user && !user.isAdmin) {
        return res.json({success: false, message: errorMessages.Forbidden});
      } else {
        return res.json({success: false, message: errorMessages.AccessDenied, logout: true});
      }
    }
  } catch (error) {
    console.log('/api/create_server first try', error);
    //return res.json({success: false, message: 'Не удалось создать новый сервер.'});
    return res.json({success: false, message: errorMessages.AccessDenied, logout: true});
  }
};

module.exports.remove_server = async function(req, res) {
  try {
    const user = await User.findById(jwt.verify(req.body.token, config.JWT_KEY));
    if (user.isAdmin) {
      try {
        const server = await _Server.findById(req.body.serverId).populate([
          {
            path: 'rooms', select: 'id', model: 'room',
            populate: {
              path: 'messages', select: 'id', model: 'roomMessage'
            }
          },
          {
            path: 'users', select: 'id', model: 'user'
          }
        ]).exec();
        try {
          for (const room of server.rooms) {
            await RoomMessage.remove({ _id: { $in: room.messages.map(msg => msg.id) } });
          }
          try {
            await Promise.all([
              Room.deleteMany({ _id: {$in: server.rooms.map(room => room.id) } }),
              User.updateMany({}, { $pull: { servers: server.id } }),
              _Server.remove({ _id: server.id })
            ]);
            for (const reciver of server.users) {
              io.toString(`User-${reciver.id}`).emit('Server_ServerRemoved', { serverId: server.id });
            }
            return res.json({success: true});
          } catch (error) {
            console.log('/api/remove_server 4 try', error);
            return res.json({success: false, message: errorMessages.ServerError});
          }
        } catch (error) {
          console.log('/api/remove_server 3 try', error);
          return res.json({success: false, message: errorMessages.ServerError});
        }
      } catch (error) {
        console.log('/api/remove_server 2 try', error);
        return res.json({success: false, message: errorMessages.ServerNotFound})
      }
    } else {
      if (user && !user.isAdmin) {
        return res.json({success: false, message: errorMessages.Forbidden});
      } else {
        return res.json({success: false, message: errorMessages.AccessDenied, logout: true});
      }
    }
  } catch (error) {
    console.log('/api/remove_server 1 try', error);
    return res.json({success: false, message: errorMessages.AccessDenied, logout: true})
  }
};

module.exports.remove_room = async function(req, res) {
  try {
    const user = await User.findById(jwt.verify(req.body.token, myJWTSecretKey));
    if (user.isAdmin) {
      try {
        const [room, server] = await Promise.all([
          await Room.findById(req.body.roomId).populate({path: 'messages', select: '_id', model: 'roomMessage'}).exec(),
          await _Server.findById(req.body.serverId).populate({path: 'users', select: 'id', model: 'user'}).exec()
        ]);
        try {
          await Promise.all([
            RoomMessage.remove({ _id: {$in: room.messages.map(msg => msg._id) } }),
            _Server.findByIdAndUpdate(req.body.serverId, {$pull: {rooms: room.id}}),
            room.remove()
          ]);
          for (const reciver of server.users) {
            io.to(`User-${user.id}`).emit('Server_RoomRemoved', {serverId: server.id, roomId: room.id});
          }
          return res.json({success: true});
        } catch (error) {
          console.log('/api/remove_room 3', error);
          return res.json({success: false, message: errorMessages.ServerError});
        }
      } catch (error) {
        console.log('/api/remove_room 2', error);
        return res.json({success: false, message: errorMessages.ServerError});
      }
    } else {
      if (user && !user.isAdmin) {
        return res.json({success: false, message: "У вас недостаточно прав."});
      } else {
        return res.json({success: false, message: errorMessages.AccessDenied, logout: true});
      }
    }
  } catch (error) {
    console.log('/api/remove_room 1 try', error);
    return res.json({success: false, message: errorMessages.AccessDenied, logout: true});
  }
}

module.exports.edit_server = async function(req, res) {
  try {
    const user = await User.findById(jwt.verify(req.body.token, config.JWT_KEY));
    if (user.isAdmin) {
      try {
        const [room, server] = await Promise.all([
          Room.findById(req.body.roomId).populate({path: 'messages', select: '_id', model: 'roomMessage'}).exec(),
          _Server.findById(req.body.serverId).populate({path: 'users', select: 'id', model: 'user'}).exec()
        ]);
        try {
          await Promise.all([
            RoomMessage.remove({ _id: { $in: room.messages.map(msg => msg.id) } }),
            _Server.findByIdAndUpdate(req.body.serverId, {$pull: {rooms: room.id}}),
            room.remove()
          ]);
          for (const reciver of server.users) {
            io.to(`User-${reciver.id}`).emit('Server_ServerUpdated', {serverId: server.id, roomId: room.id});
          }
          return res.json({success: true});
        } catch (error) {
          console.log('/api/edit_server 3', error);
          return res.json({success: false, message: errorMessages.ServerError})
        }
      } catch (error) {
        console.log('/api/edit_server 2', error);
        return res.json({success: false, message: errorMessages.ServerError})
      }
    } else {
      if (user && !user.isAdmin) {
        return res.json({success: false, message: "У вас недостаточно прав."});
      } else {
        return res.json({success: false, message: errorMessages.AccessDenied, logout: true});
      }
    }
  } catch (error) {
    console.log('/api/edit_server 1', error);
    return res.json({success: false, message: errorMessages.AccessDenied, logout: true})
  }
};

module.exports.edit_user = async function(req, res) {
  try {
    const user = await User.findById(jwt.verify(req.body.token, config.JWT_KEY)).populate([
      {path: 'servers', select: 'id', model: 'server'},
      {path: 'friends', select: 'id', model: 'user'},
      {path: 'blocked', select: 'id', model: 'user'},
      {path: 'requests.to', select: 'id', model: 'user'},
      {path: 'requests.from', select: 'id', model: 'user'},
    ]).exec();
    if (user) {
      if (req.body.username !== user.username)
        user.username = req.body.username;
      if (req.body.email !== user.email)
        user.email = req.body.email;
      if (req.body.password !== "" && typeof req.body.password !== 'undefined')
        user.password = req.body.password;
      if (req.file)
        user.image = req.file.path.substring(13);
      try {
        const updatedUser = await user.save();

        for (const server of updatedUser.servers) {
          io.to(`Server-${server.id}`).emit('Server_UserProfileUpdated', { server: server.id, user: { _id: user.id, username: user.username, status: user.status, image: user.image } });
        }

        for (const friend of updatedUser.friends) {
          io.to(`User-${friend.id}`).emit('User_FriendProfileUpdated', { user: { _id: user.id, username: user.username, status: user.status, image: user.image }});
        }

        for (const request of updatedUser.requests) {
          io.to(`User-${request.to.id === updatedUser.id ? request.from.id : request.to.id}`).emit('User_RequestProfileUpdated', { user: { _id: user.id, username: user.username, status: user.status, image: user.image } });
        }

        const theyBlockedHim = await User.find({blocked: user.id});
        if (theyBlockedHim) {
          for (const blocked of theyBlockedHim) {
            io.to(`User-${blocked.id}`).emit('User_BlockedProfileUpdated', { user: { _id: user.id, username: user.username, status: user.status, image: user.image }});
          }
        }
        return res.json({success: true, user: {username: user.username, email: user.email, image: user.image}});

      } catch (error) {
        console.log('/api/user/edit_user try', error);
        return res.json({success: false, message: errorMessages.UsernameEmailExist});
      }
    } else return res.json({success: false, message: errorMessages.AccessDenied, logout: true});
  } catch (error) {
    console.log('/api/user/edit_user try', error);
    return res.json({success: false, message: errorMessages.AccessDenied, logout: true});
  }
};

module.exports.create_room = async function(req, res) {
  try {
    const user = await User.findById(jwt.verify(req.body.token, config.JWT_KEY));
    if (user.isAdmin) {
      try {
        const newRoom = new Room({
          name: req.body.newRoomName,
          messages: []
        });
        const [createdRoom, server] = await Promise.all([
          newRoom.save(),
          _Server.findById(req.body.serverId).populate({path: 'users', select: 'id', model: 'user'})
        ]);
        try {
          await _Server.findByIdAndUpdate(req.body.serverId, {$push: {rooms: createdRoom}});
          for (const reciver of server.users) {
            io.to(`User-${reciver.id}`).emit('Server_CreateNewRoom', {serverId: server.id, room: {_id: createdRoom.id, typing: '', messages: [], name: createdRoom.name}});
          };
          return res.json({success: true});
        } catch (error) {
          console.log('/api/create_room 3 try', error);
          return res.json({ success: false, message: errorMessages.ServerError});
        }
      } catch (error) {
        console.log('/api/create_room 2 try', error);
        return res.json({ success: false, message: errorMessages.ServerError});
      }
    } else {
      if (user && !user.isAdmin) {
        return res.json({success: false, message: "У вас недостаточно прав."});
      } else {
        return res.json({success: false, message: errorMessages.AccessDenied, logout: true});
      }
    }
  } catch (error) {
    console.log('/api/create_room 1 try', error);
    return res.json({success: false, message: errorMessages.AccessDenied, logout: true})
  }
};

module.exports.cansel_request = async function(req, res) {
  try {
    const [user, newFriend] = await Promise.all([
      User.findById(jwt.verify(req.body.token, config.JWT_KEY)),
      User.findById(req.body.newFriendId)
    ]);

    if (user && newFriend) {
      user.requests = user.requests.filter(request => 
            (request.to.id === user.id && request.from.id === newFriend.id)
        ||  (request.to.id === newFriend.id && request.from.id === user.id)
      );
  
      newFriend.requests = newFriend.requests.filter(request => 
            (request.to.id === user.id && request.from.id === newFriend.id)
        ||  (request.to.id === newFriend.id && request.from.id === user.id) 
      );
  
      try {
        const [updatedUser, updatedNewFriend] = await Promise.all([
          user.save(),
          newFriend.save()
        ]);
        
        io.to(`User-${updatedUser.id}`).emit('User_RequestCanseled', { userId: updatedNewFriend.id });
        io.to(`User-${updatedNewFriend.id}`).emit('User_RequestCanseled', { userId: updatedUser.id });
      } catch (error) {
        console.log('/api/cansel_request 2 try', error);
      }
    } else {
      if (user) {
        return res.json({success: false, message: errorMessages.UserUnfound});
      } else {
        return res.json({success: false, message: errorMessages.AccessDenied, logout: true});
      }
    }
  } catch (error) {
    console.log('/api/user/cansel_request 1 try', error);
    return res.json({success: false, message: errorMessages.AccessDenied, logout: true});
  }
};

module.exports.accept_request = async function(req, res) {
  try {
    const [user, newFriend] = await Promise.all([
      User.findById(jwt.verify(req.body.token, config.JWT_KEY)).populate([
        {path: 'requests.to', select: 'id', model: 'user'},
        {path: 'requests.from', select: 'id', model: 'user'},
      ]).exec(),
      User.findById(req.body.newFriendId).populate([
        {path: 'requests.to', select: 'id', model: 'user'},
        {path: 'requests.from', select: 'id', model: 'user'},
      ]).exec(),
    ]);
    if (user && newFriend) {
      try {
        const createdDialog = await new Dialog({
          users: [user, newFriend]
        }).save();
        user.requests = user.requests.filter(request => 
          request.to.id !== user.id && request.from.id !== newFriend.id
        );
        user.dialogs.push(createdDialog.id);
        user.friends.push(newFriend.id);

        newFriend.requests = newFriend.requests.filter(request => 
          request.to.id !== user.id && request.from.id !== newFriend.id
        );
        newFriend.dialogs.push(createdDialog.id);
        newFriend.friends.push(user.id);

        try {
          const [updatedUser, updatedNewFriend] = await Promise.all([
            user.save(),
            newFriend.save()
          ]);
          io.to(`User-${updatedUser.id}`).emit('User_RequestAccepted', { user: { _id: newFriend.id, username: newFriend.username, status: newFriend.status, image: newFriend.image }, dialog: createdDialog });
          io.to(`User-${updatedNewFriend.id}`).emit('User_RequestAccepted', { user: { _id: updatedUser.id, username: updatedUser.username, status: updatedUser.status, image: updatedUser.image }, dialog: createdDialog });
        } catch (error) {
          console.log('/api/user/accept_request', error);
          return res.json({success: false, message: errorMessages.DialogSaveError});
        }
      } catch (error) {
        console.log('/api/user/accept_request', error);
        return res.json({success: false, message: errorMessages.DialogCreateError});
      }
    } else {
      if (user) {
        return res.json({success: false, message: errorMessages.UserUnfound});
      } else {
        return res.json({success: false, message: errorMessages.AccessDenied, logout: true});
      }
    }
  } catch (error) {
    console.log('/api/user/accept_request 1 try', error);
    return res.json({success: false, message: errorMessages.AccessDenied, logout: true});
  }
};

module.exports.send_request = async function(req, res) {
  try {
    const [user, newFriend] = await Promise.all([
      User.findById(jwt.verify(req.body.token, config.JWT_KEY)),
      User.findById(req.body.newFriendId)
    ]);
    if (user && newFriend) {
      user.requests.push({from: user.id, to: newFriend.id});
      newFriend.requests.push({from: user.id, to: newFriend.id});
      try {
        const [updatedUser, updatedNewFriend] = await Promise.all([
          user.save(),
          newFriend.save()
        ]);
        
        io.to(`User-${updatedUser.id}`).emit('User_SendRequest', { to: { _id: updatedNewFriend.id, username: updatedNewFriend.username, status: updatedNewFriend.status, image: updatedNewFriend.image }, from: { _id: updatedUser.id, username: updatedUser.username, status: updatedUser.status, image: updatedUser.image } });
        io.to(`User-${updatedNewFriend.id}`).emit('User_SendRequest', { to: { _id: updatedNewFriend.id, username: updatedNewFriend.username, status: updatedNewFriend.status, image: updatedNewFriend.image }, from: { _id: updatedUser.id, username: updatedUser.username, status: updatedUser.status, status: updatedUser.image } });
      } catch (error) {
        console.log('/api/user/send_request 2 try', error);
        return res.json({success: false, message: 'Ошибка на сервере.'});
      }
    } else {
      if (user) {
        return res.json({success: false, message: errorMessages.UserUnfound});
      } else {
        return res.json({success: false, message: errorMessages.AccessDenied, logout: true});
      }
    }
  } catch (error) {
    console.log('/api/user/send_request 1 try', error);
    return res.json({success: false, message: errorMessages.AccessDenied, logout: true});
  }
}

module.exports.remove_friend = async function(req, res) {
  try {
    const [user, oldFriend] = await Promise.all([
      User.findById(jwt.verify(req.body.token, config.JWT_KEY)),
      User.findById(req.body.oldFriendId)
    ]);
    try {
      if (user && oldFriend) {
        const dialog = await Dialog.findOne({users: {$all: [user, oldFriend]}}).populate({path: 'messages', select: '_id', model: 'directMessage'}).exec();
        if (dialog) {
          user.dialogs.pull(dialog);
          user.friends.pull(oldFriend);
          oldFriend.dialogs.pull(dialog);
          oldFriend.friends.pull(user);
          try {
            const [removedDialog, updatedUser, updatedOldFriend] = await Promise.all([
              dialog.remove(),
              user.save(),
              oldFriend.save(),
              DirectMessage.remove({_id: {$in: dialog.messages.map(msg => msg.id)}})
            ]);
            io.to(`User-${updatedUser.id}`).emit('User_FriendRemoved', { friendId: updatedOldFriend.id, dialogId: removedDialog.id });
            io.to(`User-${updatedOldFriend.id}`).emit('User_FriendRemoved', { friendId: updatedUser.id, dialogId: removedDialog.id });
            return res.json({success: true});
          } catch (error) {
            console.log('/api/user/remove_friend 3 try', error);
            return res.json({success: false, message: errorMessages.ServerError})
          }
        } else {
          return res.json({success: false, message: errorMessages.DialogUnfound})
        }
      } else {
        if (user) {
          return res.json({success: false, message: errorMessages.UserUnfound});
        } else {
          return res.json({success: false, message: errorMessages.AccessDenied, logout: true});
        }
      }
    } catch (error) {
      console.log('/api/user/remove_friend 2 try', error);
      return res.json({success: false, message: errorMessages.ServerError})
    }
  } catch (error) {
    console.log('/api/user/remove_friend 1 try', error);
    return res.json({success: false, message: errorMessages.AccessDenied, logout: true});
  }
}

module.exports.block_user = async function(req, res) {
  try {
    const [user, blockingUser] = await Promise.all([
      User.findById(jwt.verify(req.body.token, config.JWT_KEY)).populate([
        {path: 'requests.to', select: 'id', model: 'user'},
        {path: 'requests.from', select: 'id', model: 'user'},
      ]).exec(),,
      User.findById(req.body.blockingUserId).populate([
        {path: 'requests.to', select: 'id', model: 'user'},
        {path: 'requests.from', select: 'id', model: 'user'},
      ]).exec(),
    ]);
    if (user && blockingUser) {
      try {
        const dialog = await Dialog.findOne({users: {$all: [user, blockingUser]}}).populate({path: 'messages', select: '_id', model: 'roomMessage'}).exec();
        if (dialog) {
          await DirectMessage.remove({ _id: { $in: dialog.messages.map(msg => msg.id) } });
          user.dialogs.pull(dialog.id);
        }
        user.friends.pull(blockingUser.id);
        user.blocked.push(blockingUser.id);
        user.requests = user.requests.filter(request => 
          request.to.id !== blockingUser.id && request.from.id !== blockingUser.id
        );
        if (dialog) {
          blockingUser.dialogs.pull(dialog.id);
        }
        blockingUser.friends.pull(user.id);
        blockingUser.requests = blockingUser.requests.filter(request =>
          request.to.id !== user.id && request.from.id !== user.id
        );
        try {
          if (dialog) {
            const [removedDialog, updatedUser, updatedBlockingUser] = await Promise.all([
              dialog.remove(),
              user.save(),
              blockingUser.save()
            ]);
            io.to(`User-${updatedUser.id}`).emit('User_BlockUser', { blocked: { _id: updatedBlockingUser.id, username: updatedBlockingUser.username, status: updatedBlockingUser.status, image: updatedBlockingUser.image }, dialogId: removedDialog.id });
            io.to(`User-${updatedBlockingUser.id}`).emit('User_FriendRemoved', { friendId: updatedUser.id, dialogId: removedDialog.id });
          } else {
            const [updatedUser, updatedBlockingUser] = await Promise.all([
              user.save(),
              blockingUser.save()
            ]);
            io.to(`User-${updatedUser.id}`).emit('User_BlockUser', { blocked: { _id: updatedBlockingUser.id, username: updatedBlockingUser.username, status: updatedBlockingUser.status, image: updatedBlockingUser.image }});
            io.to(`User-${updatedBlockingUser.id}`).emit('User_FriendRemoved', { friendId: updatedUser.id });
          }
        } catch (error) {
          console.log('/api/user/block_user 3 try', error);
          return res.json({success: false, message: errorMessages.ServerError});
        }
      } catch (error) {
        console.log('/api/user/block_user 2 try', error);
        if (user) {
          return res.json({success: false, message: errorMessages.UserUnfound});
        } else {
          return res.json({success: false, message: errorMessages.AccessDenied, logout: true});
        }
      }
    } else {
      if (user) {
        return res.json({success: false, message: errorMessages.UserUnfound});
      } else {
        return res.json({success: false, message: errorMessages.AccessDenied, logout: true});
      }
    }
  } catch (error) {
    console.log('/api/user/block_user 1 try', error);
    return res.json({success: false, message: errorMessages.AccessDenied, logout: true});
  }
}

module.exports.unblock_user = async function(req, res) {
  try {
    const user = await User.findById(jwt.verify(req.body.token, config.JWT_KEY));
    if (user) {
      try {
        const blockingUser = await User.findById(req.body.blockedUserId)
        if (blockingUser) {
          try {
            await User.findByIdAndUpdate(user.id, {$pull: {blocked: blockingUser.id}});
            io.to(`User-${updatedUser.id}`).emit('User_UnblockUser', {unblockedId: blockingUser.id});
            return res.json({success: true});
          } catch (error) {
            console.log('/api/user/unblock_user 2 try', error);
            return res.json({success: false, message: errorMessages.UserUnfound});
          }
        } else {
          return res.json({success: false, message: errorMessages.UserUnfound});
        }
      } catch (error) {
        console.log('/api/user/unblock_user 2 try', error);
        return res.json({success: false, message: errorMessages.UserUnfound});
      }
    } else {
      return res.json({success: false, message: errorMessages.AccessDenied, logout: true});
    }
  } catch (error) {
    console.log('/api/user/unblock_user 1 try', error);
    return res.json({success: false, message: errorMessages.AccessDenied, logout: true});
  }
}

// module.exports.logout = async function(req, res) {
//   try {
//     const user = await User.findById(jwt.verify(req.body.token, config.JWT_KEY));
//   } catch (error) {
//     console.log('/api/user/logout 1 try', error);
//     return res.json({success: false, message: errorMessages.AccessDenied, logout: true});
//   }
// }

module.exports.ban_user = async function(req, res) {
  try {
    const user = await User.findById(jwt.verify(req.body.token, config.JWT_KEY));
    if (user.isAdmin) {
      try {
        const [banningUser, fromServer] = await Promise.all([
          User.findById(req.body.userId).select('id').exec(),
          _Server.findById(req.body.serverId).select('id').exec()
        ]);
        if (banningUser && fromServer) {
          try {
            const [server, bannedUser, messages] = await Promise.all([
              _Server.findByIdAndUpdate(data.serverId, {$pull: {users: data.userId}, $push: {blocked: data.userId}}).populate('users', 'id isAdmin').exec(),
              User.findByIdAndUpdate(data.userId, {$pull: {servers: data.serverId}}),
              RoomMessage.deleteMany({author: data.userId}).map(msg => msg.id)
            ]);
            if (messages) {
              for (const room of server.rooms) {
                await Room.updateMany({id: room.id}, {$pull: {messages: {$in : {messages}}}});
              };
            }
            for (const user of server.users) {
              if (user.isAdmin) {
                io.to(`User-${user.id}`).emit('Admin_UserBannedFromServer', {serverId: server.id, user: {_id: bannedUser.id, username: bannedUser.username, image: bannedUser.image}});
              } else io.to(`User-${user.id}`).emit('Server_UserRemoved', {serverId: server.id, userId: bannedUser.id});
            }
            return res.json({success: true});
          } catch (error) {
            console.log('/api/ban_user 3 try', error);
            return res.json({success: false, message: errorMessages.ServerError})
          }
        } else {
          return res.json({success: false, message: errorMessages.InvalidIds})
        }
      } catch (error) {
        console.log('/api/ban_user 2 try', error);
        return res.json({success: false, message: errorMessages.InvalidIds})
      }
    } else {
      if (user && !user.isAdmin) {
        return res.json({success: false, message: "У вас недостаточно прав."});
      } else {
        return res.json({success: false, message: errorMessages.AccessDenied, logout: true});
      }
    }
  } catch (error) {
    console.log('/api/ban_user 1 try', error);
    return res.json({success: false, message: errorMessages.AccessDenied, logout: true})
  }
}

module.exports.unban_user = async function(req, res) {
  try {
    const user = await User.findById(jwt.verify(req.body.token, config.JWT_KEY));
    if (user.isAdmin) {
      try {
        const [unbanningUser, fromServer] = await Promise.all([
          User.findById(req.body.userId).select('id').exec(),
          _Server.findById(req.body.serverId).select('id').exec()
        ]);
        if (unbanningUser && fromServer) {
          try {
            const [, server, unbannedUser] = await Promise.all([
              _Server.findByIdAndUpdate(fromServer.id, {$pull: {blocked: unbanningUser.id}, $push: {users: unbanningUser.id}}),
              _Server.findById(fromServer.id)
                .select('users rooms blocked name image activeRoomId')
                .populate([
                  {
                    path: 'rooms', select: 'messages name typing', model: 'room',
                    populate: {
                      path: 'messages', model: 'roomMessage',
                      populate: {
                        path: 'author', select: 'status username image', model: 'user'
                      }
                    }
                  },
                  {
                    path: 'users', select: 'username status image isAdmin', model: 'user'
                  }
                ]).exec(),
                User.findByIdAndUpdate(unbanningUser.id, {$push: {servers: fromServer.id}}).select('id username status image').exec()
            ]);
            for (const reciver of server.users) {
              if (reciver.isAdmin) {
                io.to(`User-${reciver.id}`).emit('Admin_UserUnbanned', JSON.stringify({serverId: server.id,  user: {_id: UnbannedUser.id, username: UnbannedUser.username, status: UnbannedUser.status, image: UnbannedUser.image}}));
              } else if (reciver.id === unbannedUser.id) {
                io.to(`User-${reciver.id}`).emit('NewServerAdd', JSON.stringify({server: server}));
              } else {
                io.to(`User-${reciver.id}`).emit('UserUnbannedFromServer', {serverId: server.id, user: {_id: UnbannedUser.id, username: UnbannedUser.username, status: UnbannedUser.status, image: UnbannedUser.image}});
              }
            }
            return res.json({success: true});
          } catch (error) {
            console.log('/api/unban_user 3 try', error);
            return res.json({success: false, message: errorMessages.ServerError})
          }
        } else {
          return res.json({success: false, message: errorMessages.InvalidIds})
        }
      } catch (error) {
        console.log('/api/unban_user 2 try', error);
        return res.json({success: false, message: errorMessages.InvalidIds})
      }
    } else {
      if (user && !user.isAdmin) {
        return res.json({success: false, message: "У вас недостаточно прав."});
      } else {
        return res.json({success: false, message: errorMessages.AccessDenied, logout: true});
      }
    }
  } catch (error) {
    console.log('/api/unban_user 1 try', error);
    return res.json({success: false, message: errorMessages.AccessDenied, logout: true})
  }
}