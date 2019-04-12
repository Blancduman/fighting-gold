import { SocketConstants } from '../Constants';

export default function reducer(state = {}, action = {}) {
  switch (action.type) {
    case SocketConstants.SET_SOCKET: {
      return {
        ...state,
        socket: action.socket
      }
    }

    default:
      return state;
  }
}