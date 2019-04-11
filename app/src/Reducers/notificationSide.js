import { NotificationContainer } from '../Constants';

export default function reducer(state = {variant: '', message: ''}, action = {}) {
  switch(action.type) {
    case NotificationContainer.SET_NOTIFICATION: {
      return {
        variant: action.variant,
        message: action.message
      }
    }
    default:
      return state;
  }
}