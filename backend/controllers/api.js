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
        for (const server of servers) {
          io.toString(`Server-${server.id}`).emit('UserConnectedToServer', {
            serverId: server.id,
            user: {
              _id: createdUser.id,
              username: createdUser.username,
              status: createdUser.status,
              image: createdUser.image
            }
          })
        }
        return res.json({ success: true });
      } catch (error) {
        console.log('/api/register/ third try', error);
        return res.json({success: false, message: 'Произошла ошибка на сервере.'});
      }
    } catch (error) {
      console.log('/api/register/ second try', error);
      return res.json({success: false, message: 'Произошла ошибка на сервере.'});
    }
  } catch (error) {
    console.log('/api/register first try', error);
    return res.json({success: false, message: 'Пользователь с таким username/email уже существует.'})
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
                io.to(`User-${reciver.id}`).emit('NewServerCreated', { server: serverFullInfo });
              }
              return res.json({success: true, serverName: serverFullInfo.name });
            } catch (error) {
              console.log('/api/create_server 5rd try', error);
              //return res.json({ success: false, message: 'Не удалось найти пользователя.'})
              return res.json({ success: false, message: 'Произошла ошибка на сервере.'})
            }
          } catch (error) {
            console.log('/api/create_server 4rd try', error);
            //return res.json({ success: false, message: 'Не удалось найти сервер.'})
            return res.json({ success: false, message: 'Произошла ошибка на сервере.'})
          }
          
        } catch (error) {
          console.log('/api/create_server third try', error);
          //return res.json({ success: false, message: 'Не удалось создать сервер.'})
          return res.json({ success: false, message: 'Сервер с таким именем уже существует.'})
        }
      } catch (error) {
        console.log('/api/create_server second try', error);
        //return res.json({ success: false, message: 'Не удалось создать комнату.'})
        return res.json({ success: false, message: 'Произошла ошибка на сервере.'})
      }
    }
  } catch (error) {
    console.log('/api/create_server first try', error);
    //return res.json({success: false, message: 'Не удалось создать новый сервер.'});
    return res.json({success: false, message: 'Произошла ошибка на сервере.'});
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
              io.toString(`User-${reciver.id}`).emit('ServerRemoved', { serverId: server.id });
            }
            return res.json({success: true});
          } catch (error) {
            console.log('/api/remove_server 4 try', error);
            return res.json({success: false, message: 'Произошла ошибка на сервере.'});
          }
        } catch (error) {
          console.log('/api/remove_server 3 try', error);
          return res.json({success: false, message: 'Произошла ошибка на сервере.'});
        }
      } catch (error) {
        console.log('/api/remove_server 2 try', error);
        return res.json({success: false, message: "Сервер не найден."})
      }
    } else {
      return res.json({success: false, message: "У вас недостаточно прав."});
    }
  } catch (error) {
    console.log('/api/remove_server 1 try', error);
    return res.json({success: false, message: "Произошла ошибка на сервере."})
  }
};

module.exports.remove_room = async function(req, res) {
  try {
    const user = await User.findById(jwt.verify(req.body.token, myJWTSecretKey));
    if (user.isAdmin) {
      try {
        const [room, server] = await Promise.all([
          await Room.findById(req.body.roomId).populate({ path: 'messages', select: '_id'}).exec(),
          await _Server.findById(req.body.serverId).populate({ path: 'users', select: 'id', model: 'user' }).exec()
        ]);
        try {
          await Promise.all([
            RoomMessage.remove({ _id: {$in: room.messages.map(msg => msg._id) } }),
            _Server.findByIdAndUpdate(req.body.serverId, {$pull: {rooms: room.id}}),
            room.remove()
          ]);
          for (const reciver of server.users) {
            io.to(`User-${user.id}`).emit('ServerRoomRemoved', {serverId: server.id, roomId: room.id});
          }
          return res.json({success: true});
        } catch (error) {
          console.log('/api/remove_room 3', error);
          return res.json({success: false, message: 'Произошла ошибка на сервере.'});
        }
      } catch (error) {
        console.log('/api/remove_room 2', error);
        return res.json({success: false, message: 'Произошла ошибка на сервере.'});
      }
    } else return res.json({success: false, message: 'У вас недостаточно прав.'});
  } catch (error) {
    console.log('/api/remove_room 1 try', error);
    return res.json({success: false, message: 'Произошла ошибка на сервере.'});
  }
}

module.exports.edit_server = async function(req, res) {
  try {
    const user = await User.findById(jwt.verify(req.body.token, config.JWT_KEY));
    if (user.isAdmin) {
      try {
        const [room, server] = await Promise.all([
          Room.findById(req.body.roomId).populate('messages', '_id').exec(),
          _Server.findById(req.body.serverId).populate('users', 'id').exec()
        ]);
        try {
          await Promise.all([
            RoomMessage.remove({ _id: { $in: room.messages.map(msg => msg.id) } }),
            _Server.findByIdAndUpdate(req.body.serverId, {$pull: {rooms: room.id}}),
            room.remove()
          ]);
          for (const reciver of server.users) {
            io.to(`User-${reciver.id}`).emit('ServerRoomRemoved', {serverId: server.id, roomId: room.id});
          }
          return res.json({success: true});
        } catch (error) {
          console.log('/api/edit_server 3', error);
          return res.json({success: false, message: 'Произошла ошибка на сервере.'})
        }
      } catch (error) {
        console.log('/api/edit_server 2', error);
        return res.json({success: false, message: 'Произошла ошибка на сервере.'})
      }
    } else return res.json({success: false, message: 'У вас недостаточно прав.'})
  } catch (error) {
    console.log('/api/edit_server 1', error);
    return res.json({success: false, message: 'Произошла ошибка на сервере.'})
  }
};