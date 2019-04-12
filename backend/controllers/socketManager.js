const io = require('../index').io;
const User = require('../models/user'),
      _Server = require('../models/server'),
      Room = require('../models/room'),
      RoomMessage = require('../models/roomMessage'),
      DirectMessage = require('../models/directMessage'),
      Dialog = require('../models/dialog'),
      Events = require('../constants').Events;

// const Events = {
//   ConnectToServer: 'User_ConnectToServer',
//   FriendOnline: 'User_FriendOnline',
//   BlockedOnline: 'User_BlockedOnline',
//   RequestOnline: 'User_RequestOnline',
//   JoinToServer: 'JoinToServer',
//   Logout: 'User_Logout',
//   LoadApp: 'User_LoadUser',
//   DisconnectFromServer: 'Server_UserDisconnected',
//   FriendOffline: 'User_FriendOffline',
//   BlockedOffline: 'User_BlockedOffline',
//   RequestOffline: 'RequestOnline',
//   ServerMessage: 'Server_SendMessage',
//   DialogMessage: 'User_SendMessage',
//   ServerError: 'Server_Error',
//   ServerRoomMessage: 'Server_MessageReceive',
//   DirectMessage: 'User_MessageReceive'
// };

module.exports = async function(socket) {
  try {
    const _user = await User.findById(socket.decoded_token._id);
    if(_user.isAdmin) {
      const user = await User.findByIdAndUpdate(socket.decoded_token._id, {status: 'Online'})
      .select('username image email isAdmin')
      .populate([
                  { path: 'friends', select: 'status username image', model: 'user' },
                  { path: 'blocked', select: 'status username image', model: 'user'},
                  { path: 'requests.to', select: 'status username image', model: 'user'},
                  { path: 'requests.from', select: 'status username image', model: 'user'},
                  { path: 'dialogs', select: 'users messages typing',
                    populate: [
                      {
                        path: 'users', select: 'username status image', model: 'user'
                      },
                      {
                        path: 'messages', select:'author value time createdAt', model: 'directMessage', populate: { path: 'author', select: 'status username image', model: 'user' } 
                      }
                    ] 
                  },
                  { path: 'servers', select: 'users rooms blocked name image activeRoomId', model: 'server',
                    populate: [
                      {
                        path: 'rooms', select: 'messages name typing',
                        populate: {
                          path: 'messages', select:'author value time createdAt', model: 'roomMessage',
                          populate: {
                            path: 'author', model: 'user', select: 'status username image', model: 'user'
                          }
                        }
                      },
                      {
                        path: 'users', model: 'user', select: 'username status image', model: 'user'
                      },
                      {
                        path: 'blocked', model: 'user', select: 'username status image', model: 'user'
                      }
                    ]  
                  }
                ]).exec();
      socket.join(`User-${user.id}`);
      if (user.servers) {
        for (const server of user.servers) {
          socket.join(`Server-${server.id}`);
          io.to(`Server-${server.id}`).emit(Events.ConnectToServer, { serverId: server.id, user: { _id: user.id, username: user.username, status: user.status, image: user.image } });
        }
      }
      if (user.friends) {
        for (const friend of user.friends) {
          io.to(`User-${friend.id}`).emit(Events.FriendOnline, { user: { _id: user.id } })
        }
      }
      if (user.requests) {
        for (const request of user.requests) {
          io.to(`User-${request.to.id === user.id ? request.from.id : requst.to.id}`).emit(Events.RequestOnline, { user: { _id: user.id } })
        }
      }
      const theyBlockedHim = await User.find({blocked: user.id});
      if (theyBlockedHim) {
        for (const blockedOne of theyBlockedHim) {
          io.to(`User-${blockedOne.id}`).emit(Events.BlockedOnline, { user: { _id: user.id } })
        }
      }
      socket.emit(Events.LoadApp, user);
    } else if (await User.findById(socket.decoded_token._id)) {
      const user = await User.findByIdAndUpdate(socket.decoded_token._id, {status: 'Online'})
      .select('username image email')
      .populate([
                  { path: 'friends', select: 'status username image', model: 'user' },
                  { path: 'blocked', select: 'status username image', model: 'user'},
                  { path: 'requests.to', select: 'status username image', model: 'user'},
                  { path: 'requests.from', select: 'status username image', model: 'user'},
                  { path: 'dialogs', select: 'users messages typing',
                    populate: [
                      {
                        path: 'users', select: 'username status image', model: 'user'
                      },
                      {
                        path: 'messages', select:'author value time createdAt', model: 'directMessage', populate: { path: 'author', select: 'status username image', model: 'user' } 
                      }
                    ] 
                  },
                  { path: 'servers', select: 'users rooms blocked name image activeRoomId', model: 'server',
                    populate: [
                      {
                        path: 'rooms', select: 'messages name typing',
                        populate: {
                          path: 'messages', select:'author value time createdAt', model: 'roomMessage',
                          populate: {
                            path: 'author', model: 'user', select: 'status username image', model: 'user'
                          }
                        }
                      },
                      {
                        path: 'users', model: 'user', select: 'username status image', model: 'user'
                      }
                    ]  
                  }
                ]).exec();
      if (user) {
        socket.join(`User-${user.id}`);
        if (user.servers) {
          for (const server of user.servers) {
            socket.join(`Server-${server.id}`);
            io.to(`Server-${server.id}`).emit(Events.ConnectToServer, { serverId: server.id, user: { _id: user.id } });
          }
        }
        if (user.friends) {
          for (const friend of user.friends) {
            io.to(`User-${friend.id}`).emit(Events.FriendOnline, { user: { _id: user.id } })
          }
        }
        if (user.requests) {
          for (const request of user.requests) {
            io.to(`User-${request.to.id === user.id ? request.from.id : requst.to.id}`).emit(Events.RequestConnected, { user: { _id: user.id } })
          }
        }
        const theyBlockedHim = await User.find({blocked: user.id});
        if (theyBlockedHim) {
          for (const blockedOne of theyBlockedHim) {
            io.to(`User-${blockedOne.id}`).emit(Events.BlockedOnline, { user: { _id: user.id } })
          }
        }
        socket.emit(Events.LoadApp, user);
      } else {
        socket.emit(Events.Logout);
      }
    } else {
      socket.emit(Events.Logout);
    }
  } catch (error) {
    socket.emit(Events.Logout);
  }
  
  
  socket.on(Events.JoinToServer, async data => {
    try {
      const user = await User.findById(socket.decoded_token._id).select('id username status image').exec();
      if (user) {
        socket.join(`Server-${data.serverId}`);
        io.to(`Server-${data.serverId}`).emit('UserJoinedToServer', { serverId: data.serverId, user: { _id: user.id, username: user.username, status: user.status, image: user.image } });
      } else {
        socket.emit(Events.Logout);
      }
    } catch (error) {
      socket.emit(Events.Logout);
    }
  });

  socket.on('disconnect', async () => {
    try {
      const user = await User.findByIdAndUpdate(socket.decoded_token._id, {status: 'Offline'}).populate([
        {path: 'servers', select: 'id', model:'server'},
        {path: 'friends', select: 'id', model:'user'},
        {path: 'blocked', select: 'id', model:'user'},
        {path: 'requests.to', select: 'id', model:'user'},
        {path: 'requests.from', select: 'id', model:'user' },,
      ]).exec();
      if (user.servers) {
        for (const server of user.servers) {
          io.to(`Server-${server.id}`).emit(Events.DisconnectFromServer, { user: { _id: user.id }, serverId: server.id });
          socket.leave(`Server-${server.id}`);
        }
      }
      if (user.friends) {
        for (const friend of user.friends) {
          io.to(`User-${friend.id}`).emit(Events.FriendOffline, { user: { _id: user.id } });
        }
      }
      if (user.requests) {
        for (const request of user.requests) {
          io.to(`User-${request.to.id === user.id? request.from.id: requst.to.id}`).emit(Events.RequestOffline, { user: { _id: user.id } });
        }
      }
      const theyBlockedHim = await User.find({blocked: user.id});
      if (theyBlockedHim) {
        for (const blockedOne of theyBlockedHim) {
          io.to(`User-${blockedOne.id}`).emit(Events.BlockedOffline, { user: { _id: user.id } })
        }
      }
      socket.leave(`User-${user.id}`);
    } catch (error) {
      console.log('socket disconnect', error);
      socket.emit(Events.Logout);
    }
  });

  socket.on(Events.ServerMessage, async data => {
    try {
      const [user, server] = await Promise.all([
        User.findById(socket.decoded_token._id),
        _Server.findById(data.serverId).populate({path: 'users', select: 'username image status', model: 'user'}).exec(),
      ]);
      try {
        const createdRoomMessage = await new RoomMessage({
          author: user,
          value: data.message.value
        }).save();
        try {
          await Room.findByIdAndUpdate(data.roomId, {$push: {messages: createdRoomMessage}});
          const updatedRoom = await Room.findById(data.roomId).populate({
            path: 'messages', select:'author value time createdAt', model: 'roomMessage',
            populate: {
              path: 'author', model: 'user', select: 'status username image', model: 'user'
            }
          });
          io.to(`Server-${server.id}`).emit(Events.ServerRoomMessage, {
            server: server.id,
            room: updatedRoom.id,
            message: {
              _id: createdRoomMessage.id,
              value: createdRoomMessage.value,
              time: createdRoomMessage.time,
              author: { 
                _id: createdRoomMessage.author.id,
                username: createdRoomMessage.author.username,
                image: createdRoomMessage.author.image
              }
            }
          });
        } catch (error) {
          console.log('ServerMessage 3 try', error);
          socket.emit(Events.ServerError);
        }
      } catch (error) {
        console.log('ServerMessage 2 try', error);
        socket.emit(Events.ServerError);
      }
    } catch (error) {
      socket.emit(Events.Logout);
    }
  });

  socket.on(Events.DialogMessage, async data => {
    try {
      const [user, dialog] = await Promise.all([
        User.findById(socket.decoded_token._id),
        Dialog.findById(data.dialogId).populate({path: 'users', select: 'username image status', model: 'user'}).exec(),
      ]);
      try {
        const createdDialogMessage = await new DirectMessage({
          author: user,
          value: data.value
        }).save();
        try {
          const updatedDialog = await Dialog.findByIdAndUpdate(dialog.id, {$push: {messages: createdDialogMessage}}).populate({path: 'users', select: 'username image status', model: 'user'}).exec();
          //const updatedDialog = await Dialog.findById(dialog.id).populate({path: 'users', select: 'username image status', model: 'user'}).exec();
          let message = {
            dialog: updatedDialog.id,
            message: {
              _id: createdDialogMessage.id,
              value: createdDialogMessage.value,
              time: createdDialogMessage.time,
              author: {
                _id: createdDialogMessage.author.id,
                username: createdDialogMessage.author.username,
                image: createdDialogMessage.author.image
              }
            }
          };
          io.to(`User-${updatedDialog.users[0].id}`).emit(Events.DirectMessage, message);
          io.to(`User-${updatedDialog.users[1].id}`).emit(Events.DirectMessage, message);
        } catch (error) {
          console.log('ServerMessage 3 try', error);
          socket.emit(Events.ServerError);
        }
      } catch (error) {
        console.log('ServerMessage 2 try', error);
        socket.emit(Events.ServerError);
      }
    } catch (error) {
      socket.emit(Events.Logout);
    }
  });
};