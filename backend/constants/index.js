module.exports.errorMessages = {
  ServerError: 'Произошла ошибка на сервере.',
  UserExist: 'Пользователь с таким username/email уже существует.',
  ServerName: 'Сервер с таким именем уже существует.',
  Forbidden: 'У вас недостаточно прав.',
  AccessDenied: 'Доступ запрещен. Войдите в систему.',
  ServerNotFound: 'Сервер не найден.',
  UsernameEmailExist: 'Такой username/email уже занят.',
  UserUnfound: 'Пользователь не найдет.',
  DialogSaveError: 'Ошибка при сохранении диалога.',
  DialogCreateError: 'Ошибка при создании диалога.',
  DialogUnfound: 'Диалог не найден.',
  InvalidIds: 'Неверный id пользователя и/или сервера.'
}

module.exports.Events = {
  ConnectToServer: 'User_ConnectToServer',
  FriendOnline: 'User_FriendOnline',
  BlockedOnline: 'User_BlockedOnline',
  RequestOnline: 'User_RequestOnline',
  JoinToServer: 'JoinToServer',
  Logout: 'User_Logout',
  LoadApp: 'User_LoadUser',
  DisconnectFromServer: 'Server_UserDisconnected',
  FriendOffline: 'User_FriendOffline',
  BlockedOffline: 'User_BlockedOffline',
  RequestOffline: 'RequestOnline',
  ServerMessage: 'Server_SendMessage',
  DialogMessage: 'User_SendMessage',
  ServerError: 'Server_Error',
  ServerRoomMessage: 'Server_MessageReceive',
  DirectMessage: 'User_MessageReceive'
};