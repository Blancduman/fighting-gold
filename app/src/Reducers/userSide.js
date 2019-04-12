import { UserConstants } from '../Constants';

export default function reducer(state = { requests: [], user: {}, friends: [], blocked: []}, action = {}) {
  switch (action.type) {
    case UserConstants.SET_USER: {
      return {
        ...state,
        user: action.user
      }
    }
    case UserConstants.USER_CHANGED: {
      const user = state.user;
      if (state.user.username !== action.username) {
        user.username = action.username;
      }
      if (state.user.email !== action.email) {
        user.email = action.email;
      }
      if (state.user.image !== action.image) {
        user.image = action.image;
      }
      return {
        ...state,
        user: user
      };
    };
    case UserConstants.REQUEST_EDIT: {
      const requests = state.requests.map(request => {
        if (request.to._id === action.user._id) {
          request.to = action.user;
        } else if (request.from._id === action.user._id) {
          request.from = action.user;
        }
        return request;
      });
      return {
        ...state,
        requests: requests
      };
    }
    case UserConstants.BLOCKED_EDIT: {
      const blocked = state.blocked.map(blockedOne => {
        if (blockedOne._id === action.user._id) {
          blockedOne = action.user;
        }
        return blockedOne;
      });
      return {
        ...state,
        blocked: blocked
      };
    }
    case UserConstants.FRIEND_EDIT: {
      const friends = state.friends.map(friend => {
        if (friend._id === action.user._id) {
          friend = action.user;
        }
        return friend;
      });
      return {
        ...state,
        friends: friends
      };
    }
    case UserConstants.SET_REQUESTS: {
      return {
        ...state,
        requests: action.requests
      }
    }
    case UserConstants.SET_FRIENDS: {
      return {
        ...state,
        friends: action.friends
      }
    }
    case UserConstants.SET_BLOCKED: {
      return {
        ...state,
        blocked: action.blocked
      }
    }
    case UserConstants.FRIEND_CONNECTED: {
      const friends = state.friends.map(friend => {
        if (friend._id === action.friendId) {
          friend.status = 'Online';
        }
        return friend;
      });
      return {
        ...state,
        friends: friends
      };
    };
    case UserConstants.FRIEND_DISCONNECTED: {
      const friends = state.friends.map(friend => {
        if (friend._id === action.friendId) {
          friend.status = 'Offline';
        }
        return friend;
      });
      return {
        ...state,
        friends: friends
      };
    }
    case UserConstants.FRIEND_REMOVED: {
      const friends = state.friends.filter(friend => {
        if (friend._id !== action.friendId) {
          return friend;
        }
      });
      return {
        ...state,
        friends: friends
      };
    }
    case UserConstants.ADD_FRIEND_REQUEST: {
      return {
        ...state,
        requests: state.requests.concat({to: action.to, from: action.from})
      }
    }
    case UserConstants.FRIEND_REQUEST_ACCEPTED: {
      const requests = state.requests.filter(request => request.from._id !== action.friend._id && request.to._id !== action.friend._id);
      return {
        ...state,
        requests: requests,
        friends: state.friends.concat({_id: action.friend._id, username: action.friend.username, status: action.friend.status, image: action.friend.image})
      };
    }
    case UserConstants.FRIEND_REQUEST_CANSELED: {
      const requests = state.requests.filter(request => request.from._id !== action.userId && request.to._id !== action.userId);
      return {
        ...state,
        requests: requests
      };
    }

    case UserConstants.BLOCKED_CONNECTED: {
      const blocked = state.blocked.map(blockenOne => {
        if (blockenOne._id === action.blockedId) {
          blockenOne.status = 'Online';
        }
        return blockenOne;
      });
      return {
        ...state,
        blocked: blocked
      };
    }
    case UserConstants.BLOCKED_DISCONNECTED: {
      const blocked = state.blocked.map(blockenOne => {
        if (blockenOne._id === action.blockedId) {
          blockenOne.status = 'Offline';
        }
        return blockenOne;
      });
      return {
        ...state,
        blocked: blocked
      };
    }
    case UserConstants.REQUEST_CONNECTED: {
      const requests = state.requests.map(request => {
        if (request.to._id === action.userId || request.from._id === action.userId) {
          request.status = 'Online';
        }
        return request;
      });
      return {
        ...state,
        requests: requests
      };
    };
    case UserConstants.REQUEST_DISCONNECTED: {
      const requests = state.requests.map(request => {
        if (request.to._id === action.userId || request.from._id === action.userId) {
          request.status = 'Offline';
        }
        return request;
      });
      return {
        ...state,
        requests: requests
      };
    };
    case UserConstants.USER_BLOCK: {
      const friends = state.friends.filter(friend => friend._id !== action.blocked._id);
      const requests = state.requests.filter(request => request.to._id === action.blocked._id || request.from._id === action.blocked._id);
      state.blocked.push({_id: action.blocked._id, username: action.blocked.username, status: action.blocked.status, image: action.blocked.image});
      return {
        ...state,
        friends: friends,
        requests: requests
      };
    }
    case UserConstants.USER_UNBLOCK: {
      const blocked = state.blocked.filter(blockedOne => blockedOne._id !== action.unblockedId);
      return {
        ...state,
        blocked: blocked
      }
    }

    default:
      return state;
  }
}