import { homeConstants } from '../Constants';

export default function reducer(state = { dialogs: [], activeDialogId: '', activeFriendsTableTab: 0}, action = {}) {
  switch (action.type) {
    case homeConstants.SET_DIALOGS: {
      return {
        ...state,
        dialogs: action.dialogs
      }
    }
    case homeConstants.MOVE_TO_FRIEND_DIALOG: {
      const dialog = state.dialogs.find(dialog => dialog.users.findIndex(user => user._id === action.friendId) !== -1)
      return {
        ...state,
        activeDialogId: dialog._id
      };
    }
    case homeConstants.SET_ACTIVE_DIALOG_ID:
      return {
        ...state,
        activeDialogId: action.dialogId
      };
    case homeConstants.SET_ACTIVE_FRIENDS_TABLE_TAB:
      console.log(action.tab);
      return {
        ...state,
        activeFriendsTableTab: action.tab
      };
    case homeConstants.SET_DIALOG_TYPING_VALUE: {
      const dialogs = state.dialogs.map(dialog => {
        if (dialog._id === state.activeDialogId)
          dialog.typing = action.typing;
        return dialog;
      });
      return {
        ...state,
        dialogs: dialogs
        
      };
    }
    case homeConstants.RECEIVE_DIALOG_MESSAGE:  {
      const dialogs = state.dialogs.map(dialog => {
        if (dialog._id === action.data.dialog) {
          let message = action.data.message;
          dialog.messages = [
            ...dialog.messages,
            message
          ]
        }
        return dialog;
      });
      return {
        ...state,
        dialogs: dialogs
      };
    };
    case homeConstants.FRIEND_REQUEST_ACCEPTED: {
      return {
        ...state,
        dialogs: state.dialogs.concat(action.dialog)
      };
    };
    case homeConstants.FRIEND_REMOVED: {
      const dialogs = state.dialogs.filter(dialog => dialog._id !== action.dialogId);
      return {
        ...state,
        dialogs
      };
    };
    case homeConstants.USER_BLOCK: {
      const dialogs = state.dialogs.filter(dialog => dialog._id !== action.dialogId);
      return {
        ...state,
        dialogs
      };
    };

    default:
      return state;
  }
}