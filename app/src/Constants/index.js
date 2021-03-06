export const ServerAddress = 'http://localhost:8000';

export const SocketEmit = {
  JoinToServer: 'JoinToServer',
  ServerMessage: 'Server_SendMessage',
  DialogMessage: 'User_SendMessage',
}

export const SocketOn = {
  LoadApp: 'User_LoadUser',
  Logout: 'User_Logout',
  ConnectToServer: 'User_ConnectToServer',
  DisconnectFromServer: 'Server_UserDisconnected',
  FriendOnline: 'User_FriendOnline',
  FriendOffline: 'User_FriendOffline',
  BlockedOnline: 'User_BlockedOnline',
  BlockedOffline: 'User_BlockedOffline',
  RequestOnline: 'User_RequestOnline',
  RequestOffline: 'RequestOnline',
  ServerRoomMessage: 'Server_MessageReceive',
  DirectMessage: 'User_MessageReceive',
  ServerError: 'Server_Error',
  Send_Request: 'User_SendRequest',
  Accept_Request: 'User_RequestAccepted',
  Cansel_Request: 'User_RequestCanseled',
  Remove_Friend: 'User_FriendRemoved',
  Block_User: 'User_BlockUser',
  Unblock_User: 'User_UnblockUser',
  AddRoom: 'Server_CreateNewRoom',
  AddServer: 'Server_ServerCreated',
  RemoveServer: 'Server_ServerRemoved',
  BanUser: 'Admin_UserBannedFromServer',
  UnbanUser: 'Admin_UserUnbanned',
  KickUser: 'Server_UserRemoved',
  RemoveRoom: 'Server_RoomRemoved',
  ServerUserUpdated: 'Server_UserProfileUpdated',
  FriendUpdated: 'User_FriendProfileUpdated',
  BlockedUpdated: 'User_BlockedProfileUpdated',
  RequestUpdated: 'User_RequestProfileUpdated',
  ServerUpdated: 'Server_ServerUpdated',
  UserJoinServer: 'User_UserJoinedToServer'
}

export const NotificationContainer = {
  SET_NOTIFICATION: 'SET_NOTIFICATION'
}

export const serversContainer = {
  SET_SERVER: 'SET_SERVER',
  SET_ACTIVE_ROOM_ID: 'SET_ACTIVE_ROOM_ID',
  SET_ACTIVE_SERVER_ID: 'SET_ACTIVE_SERVER_ID',
  SET_TYPING_VALUE: 'SET_TYPING_VALUE',
  RECEIVE_SERVER_ROOM_MESSAGE: 'RECEIVE_SERVER_ROOM_MESSAGE',

  USER_DISCONNECTED_FROM_SERVER: 'USER_DISCONNECTED_FROM_SERVER',
  USER_CONNECTED_TO_SERVER: 'USER_CONNECTED_TO_SERVER',

  SEND_SERVER_ROOM_MESSAGE: 'SEND_SERVRE_ROOM_MESSAGE',
  SEND_SERVER_ROOM_MESSAGE_SUCCESS: 'SEND_SERVRE_ROOM_MESSAGE_SUCCESS',
  SEND_SERVER_ROOM_MESSAGE_FAIL: 'SEND_SERVRE_ROOM_MESSAGE_FAIL',

  REMOVE_USER_FROM_SERVER: 'REMOVE_USER_FROM_SERVER',
  USER_UNBANNED_FROM_SERVER: 'USER_UNBANNED_FROM_SERVER',
  ADMIN_USER_BANNED_FROM_SERVER: 'ADMIN_USER_BANNED_FROM_SERVER',
  ADMIN_USER_UNBANNED_FROM_SERVER: 'ADMIN_USER_UNBANNED_FROM_SERVER',
  YOU_UNBANNED_FROM_SERVER: 'YOU_UNBANNED_FROM_SERVER',
  NEW_USER_JOINED_TO_SERVER: 'NEW_USER_JOINED_TO_SERVER',

  SERVER_USER_EDIT: 'SERVER_USER_EDIT',

  ADD_NEW_SERVER: 'ADD_NEW_SERVER',
  ADD_NEW_ROOM_TO_SERVER: 'ADD_NEW_ROOM_TO_SERVER',
  SERVER_CHANGED_SETTINGS: 'SERVER_CHANGED_SETTINGS',
  REMOVE_ROOM_FROM_SERVER: 'REMOVE_ROOM_FROM_SERVER',
  REMOVE_SERVER: 'REMOVE_SERVER'
}

export const homeConstants = {
  SET_ACTIVE_DIALOG_ID: 'SET_ACTIVE_DIALOG_ID',
  SET_ACTIVE_FRIENDS_TABLE_TAB: 'SET_ACTIVE_FRIENDS_TABLE_TAB',
  SET_DIALOG_TYPING_VALUE: 'SET_DIALOG_TYPING_VALUE',
  RECEIVE_DIALOG_MESSAGE: 'RECEIVE_DIALOG_MESSAGE',
  SET_DIALOGS: 'SET_DIALOGS',

  SEND_DIALOG_MESSAGE: 'SEND_DIALOG_MESSAGE',
  SEND_DIALOG_MESSAGE_SUCCESS: 'SEND_DIALOG_MESSAGE_SUCCESS',
  SEND_DIALOG_MESSAGE_FAIL: 'SEND_DIALOG_MESSAGE_FAIL',

  FRIEND_REQUEST_ACCEPTED: 'FRIEND_REQUEST_ACCEPTED',
  FRIEND_REMOVED: 'FRIEND_REMOVED',
  USER_BLOCK: 'USER_BLOCK',
  USER_UNBLOCK: 'USER_UNBLOCK',

  MOVE_TO_FRIEND_DIALOG: 'MOVE_TO_FRIEND_DIALOG'
};

export const SocketConstants = {
  SET_SOCKET: 'SET_SOCKET'
}

export const UserConstants = {
  SET_USER: 'SET_USER',
  SET_FRIENDS: 'SET_FRIENDS',
  SET_BLOCKED: 'SET_BLOCKED',
  SET_REQUESTS: 'SET_REQUESTS',
  USER_CHANGED: 'USER_CHANGED',

  FRIEND_CONNECTED: 'FRIEND_CONNECTED',
  FRIEND_REQUEST_CANSELED: 'FRIEND_REQUEST_CANSELED',
  FRIEND_REQUEST_ACCEPTED: 'FRIEND_REQUEST_ACCEPTED',
  FRIEND_REMOVED: 'FRIEND_REMOVED',

  FRIEND_EDIT: 'FRIEND_EDIT',
  BLOCKED_EDIT: 'BLOCKED_EDIT',
  REQUEST_EDIT: 'REQUEST_EDIT',

  ADD_FRIEND_REQUEST: 'ADD_FRIEND_REQUEST',
  
  BLOCKED_CONNECTED: 'BLOCKED_CONNECTED',
  REQUEST_CONNECTED: 'REQUEST_CONNECTED',
  BLOCKED_DISCONNECTED: 'BLOCKED_DISCONNECTED',
  REQUEST_DISCONNECTED: 'REQUEST_DISCONNECTED',
  FRIEND_DISCONNECTED: 'FRIEND_DISCONNECTED',
  
  USER_BLOCK: 'USER_BLOCK',
  USER_UNBLOCK: 'USER_UNBLOCK',
  USER_DISCONNECTED: 'USER_DISCONNECTED'
}