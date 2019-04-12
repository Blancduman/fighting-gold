import { serversContainer } from '../Constants';

export default function reducer(state = { }, action = {}) {
  switch (action.type) {
    case serversContainer.SET_SERVER: {
      return {
        ...state,
        servers: action.servers
      }
    }
    case serversContainer.SET_ACTIVE_SERVER_ID: {
      return {
        ...state,
        activeServerId: action.serverId
      };
    }
    case serversContainer.REMOVE_ROOM_FROM_SERVER: {
      const servers = state.servers.map(server => {
        if (server._id === action.serverId) {
          server.rooms = server.rooms.filter(room => room._id !== action.roomId);
        }
        return server;
      });
      return {
        ...state,
        servers: servers
      };
    }
    case serversContainer.REMOVE_SERVER: {
      const servers = state.servers.filter(server => server._id !== action.serverId);
      return {
        ...state,
        servers: servers
      };
    }
    case serversContainer.ADD_NEW_SERVER: {
      const newServer = action.server;
      newServer.activeRoomId = newServer.rooms[0]._id;
      return {
        ...state,
        servers: state.servers.concat(newServer)
      }
    }
    case serversContainer.USER_UNBANNED_FROM_SERVER: {
      const servers = state.servers.map(server => {
        if (server._id === action.serverId) {
          server.users.push(action.user);
        }
        return server;
      });
      return {
        ...state,
        servers: servers
      };
    }
    case serversContainer.ADMIN_USER_UNBANNED_FROM_SERVER: {
      const servers = state.servers.map(server => {
        server.blocked = server.blocked.filter(blockedOne => blockedOne._id !== action.user._id);
        server.users.push({_id: action.user._id, username: action.user.username, status: action.user.status});
        return server;
      });
      return {
        ...state,
        servers: servers
      };
    }
    case serversContainer.ADMIN_USER_BANNED_FROM_SERVER: {
      const servers = state.servers.map(server => {
        if (server._id === action.serverId) {
          server.users = server.users.filter(user => user._id !== action.user._id);
          server.blocked.push({_id: action.user._id, username: action.user.username});
        }
        return server;
      });
      return {
        ...state,
        servers: servers
      };
    }
    case serversContainer.REMOVE_USER_FROM_SERVER: {
      let servers;
      if (action.userId === action.myId) {
        servers = state.servers.filter(server => server._id !== action.serverId);
      } else {
        servers = state.servers.map(server => {
          server.users = server.users.filter(user => user._id !== action.userId)
          server.rooms = server.rooms.map(room => {
            room.messages = room.messages.filter(msg => msg.author._id !== action.userId);
            return room;
          });
          return server;
        });
      }
      return {
        ...state,
        servers: servers
      };
    }
    case serversContainer.SERVER_USER_EDIT: {
      const servers = state.servers.map(server => {
        server.users = server.users.map(user => {
          if (user._id === action.user._id) {
            user = action.user;
          }
          return user;
        });
        return server;
      });

      return {
        ...state,
        servers: servers
      }
    }
    case serversContainer.SERVER_CHANGED_SETTINGS: {
      const servers = state.servers.map(server => {
        if (action.serverId === server._id) {
          if (action.server.name)
            server.name = action.server.name;
          if (action.server.image)
            server.image = action.server.image;
        }
        return server;
      });
      return {
        ...state,
        servers: servers
      }
    }
    case serversContainer.ADD_NEW_ROOM_TO_SERVER: {
      const servers = state.servers.map(server => {
        if (action.serverId === server._id) {
          server.rooms.push(action.room);
        }
        return server;
      });
      return {
        ...state,
        servers: servers
      };
    }
    case serversContainer.SET_ACTIVE_ROOM_ID: {
      const servers = state.servers.map((server) => { 
        if (server._id !== state.activeServerId)
          return server;
        return {
          ...server,
          activeRoomId: action.roomId
        };
      });
      return {
        ...state,
        servers: servers
      };
    }
    case serversContainer.SET_TYPING_VALUE: {
      const servers = state.servers.map((server) => { 
        if (server._id !== state.activeServerId)
          return server;
        server.rooms.map(room => {
          if (room._id !== server.activeRoomId)
            return room;
            room.typing = action.typing;
          return room;
        });
        return server;
      });
      return {
        ...state,
        servers: servers
      };
    };
    case serversContainer.NEW_USER_JOINED_TO_SERVER: {
      const servers = state.servers.map(server => {
        if (server._id === action.serverId) {
          server.users.push(action.user);
        }
        return server;
      });
      return {
        ...state,
        servers: servers
      };
    }
    case serversContainer.USER_CONNECTED_TO_SERVER: {
      let servers;
      if (state.servers) {
        servers = state.servers.map(server => {
          if (server._id === action.serverId) {
            server.users = server.users.map(user => {
              if (user._id === action.userId) {
                user.status = 'Online';
              }
              return user;
            });
          }
          return server;
        });
        return {
          ...state,
          servers: servers
        };
      } 
      else return state;
    };
    case serversContainer.USER_DISCONNECTED_FROM_SERVER: {
      const servers = state.servers.map(server => {
        if (server._id === action.serverId) {
          server.users = server.users.map(user => {
            if (user._id === action.user._id) {
              user.status = 'Offline';
            }
            return user;
          });
        }
        return server;
      });
      return {
        ...state,
        servers: servers
      };
    };
    case serversContainer.RECEIVE_SERVER_ROOM_MESSAGE: {
      const servers = state.servers.map((server) => { 
        if (server._id !== action.data.server)
          return server;
        server.rooms.map(room => {
          if (room._id !== action.data.room)
            return room;
            let message = action.data.message;
            room.messages = [
              ...room.messages,
              message
            ];
          return room;
        });
        return server;
      });
      return {
        ...state,
        servers: servers
      }
    }

    default:
      return state;
  }
}