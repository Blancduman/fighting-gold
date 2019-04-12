import { combineReducers } from 'redux';
import homeSide from './homeSide';
import serverSide from './serverSide';
import socketSide from './socketSide';
import userSide from './userSide';
import NotificationSide from './NotificationSide';

export default combineReducers({
  homeSide,
  serverSide,
  socketSide,
  userSide,
  NotificationSide
})