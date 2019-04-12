import React from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import Login from './Containers/Login';
import Register from './Containers/Register';
import Home from './Containers/Home';
import ServerWrapper from './Containers/ServerWrapper';
import { connect } from 'react-redux';
import io from 'socket.io-client';
import {
  NotificationContainer, UserConstants, serversContainer, homeConstants, SocketConstants, ServerAddress, SocketOn, SocketEmit
} from './Constants';

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={props => (
      localStorage.getItem('token')
        ? <Component {...props} />
        : <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
  )} />
)

const AuthRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={props => (
      !localStorage.getItem('token')
        ? <Component {...props} />
        : <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
  )} />
)

class App extends React.Component {
  componentWillMount() {
    const token = localStorage.getItem('token');
    if (token) {
      const socket = io(ServerAddress, {
        'query': `token=${token}`
      }).on(SocketOn.LoadApp, data => {
        data.isAdmin 
        ? this.props.setUser({ _id: data._id, username: data.username, email: data.email, isAdmin: true, image: data.image })
        : this.props.setUser({ _id: data._id, username: data.username, email: data.email, image: data.image });
        this.props.setFriends(data.friends);
        this.props.setServers(data.servers.map((server) => { return { ...server, activeRoomId: server.rooms[0]._id }}));
        this.props.setBlocked(data.blocked);
        this.props.setDialogs(data.dialogs);
        this.props.setRequests(data.requests);
      }).on(SocketOn.ServerRoomMessage , data => {
        this.props.receiveServerMessage(data);
      }).on(SocketOn.DirectMessage , data => {
        this.props.receiveDialogMessage(data);
      }).on(SocketOn.ConnectToServer , data => {
        this.props.userConnectedToServer(data.user._id, data.serverId);
      }).on(SocketOn.FriendOnline , data => {
        this.props.friendConnected(data.user._id);
      }).on(SocketOn.FriendOffline , data => {
        this.props.friendDisconnected(data.user._id);
      }).on(SocketOn.BlockedOnline , data => {
        this.props.blockedConnected(data.user._id);
      }).on(SocketOn.BlockedOffline , data => {
        this.props.blockedDisconnected(data.user._id);
      }).on(SocketOn.RequestOnline , data => {
        this.props.requestConnected(data.user._id);
      }).on(SocketOn.RequestOffline , data => {
        this.props.requestDisconnected(data.user._id);
      }).on(SocketOn.Send_Request , data => {
        this.props.addFriendRequest(data.to, data.from);
      }).on(SocketOn.Cansel_Request , data => {
        this.props.friendRequestCanseled(data.userId);
      }).on(SocketOn.Accept_Request , data => {
        this.props.addFriend(data.user, data.dialog);
      }).on(SocketOn.Remove_Friend , data => {
        this.props.removeFriend(data.friendId, data.dialogId);
      }).on(SocketOn.Block_User , data => {
        this.props.blockUser(data.blocked, data.dialogId);
      }).on(SocketOn.Unblock_User , data => {
        this.props.unblockUser(data.unblockedId);
      }).on(SocketOn.DisconnectFromServer , data => {
        this.props.UserDisconnectedFromServer(data.user, data.serverId);
      }).on(SocketOn.AddRoom , data => {
        this.props.addNewRoomInServer(data.serverId, data.room);
      }).on(SocketOn.AddServer , data => {
        this.props.addNewServer(data.server);
        socket.emit(SocketEmit.JoinToServer, {serverId: data.server._id});
      }).on(SocketOn.RemoveServer , data => {
        this.props.removeServer(data.serverId)
      }).on(SocketOn.BanUser , data => {
        this.props.adminBanUserFromServer(data.serverId, data.user);
      }).on(SocketOn.KickUser , data => {
        this.props.removeUserFromServer(data.serverId, data.userId, this.props.user._id);
      }).on(SocketOn.UnbanUser , data => {
        this.props.adminRemoveFromBanList(data.serverId, data.user);
      }).on(SocketOn.RemoveRoom , data => {
        this.props.removeRoomFromServer(data.serverId, data.roomId);
      }).on(SocketOn.ServerUserUpdated , data => {
        this.props.serverUserChanged(data.server, data.user);
      }).on(SocketOn.FriendUpdated , data => {
        this.props.friendChanged(data.user);
      }).on(SocketOn.BlockedUpdated , data => {
        this.props.blockedChanged(data.user);
      }).on(SocketOn.RequestUpdated , data => {
        this.props.requestChanged(data.user);
      }).on(SocketOn.UserJoinServer, data => {
        this.props.newUserJoinedToServer(data.serverId, data.user);
      }).on(SocketOn.ServerUpdated, data => {
        this.props.setNewChangesToServer(data.serverId, data.server);
      }).on(SocketOn.Logout, () => {
        localStorage.removeItem('token');
        window.location.reload();
      }).on(SocketOn.ServerError, data => {
        this.props.setNotification(data.variant, data.message);
      });
      this.props.setSocket(socket);
    }
  }
  render() {
    return (
        <BrowserRouter>
          <Switch>
            <PrivateRoute exact path="/" component={Home} />
            <AuthRoute path="/login" component={Login} />
            <AuthRoute path="/register" component={Register}/>
            <PrivateRoute path="/server/:server_id" component={ServerWrapper} />
          </Switch>
        </BrowserRouter>
    )
  }
}

const mapStateToProps = state => {
  return {
    user: state.userSide.user
  };
}
const mapDispatchToProps = dispatch => {
  return {
    serverUserChanged: (serverId, user) => dispatch({type: serversContainer.SERVER_USER_EDIT, serverId: serverId, user: user}),
    friendChanged: user => dispatch({type: UserConstants.FRIEND_EDIT, user: user}),
    blockedChanged: user => dispatch({type: UserConstants.BLOCKED_EDIT, user: user}),
    requestChanged: user => dispatch({type: UserConstants.REQUEST_EDIT, user: user}),
    setSocket: socket => dispatch({ type: SocketConstants.SET_SOCKET, socket: socket }),
    setUser: user => dispatch({ type: UserConstants.SET_USER, user: user }),
    setFriends: friends => dispatch({ type: UserConstants.SET_FRIENDS, friends: friends}),
    setBlocked: blocked => dispatch({ type: UserConstants.SET_BLOCKED, blocked: blocked }),
    setServers: servers => dispatch({ type: serversContainer.SET_SERVER, servers: servers }),
    setDialogs: dialogs => dispatch({ type: homeConstants.SET_DIALOGS, dialogs: dialogs }),
    setRequests: requests => dispatch({ type: UserConstants.SET_REQUESTS, requests: requests}),
    friendConnected: friendId => dispatch({ type: UserConstants.FRIEND_CONNECTED, friendId: friendId }),
    friendDisconnected: friendId => dispatch({ type: UserConstants.FRIEND_DISCONNECTED, friendId: friendId }),
    blockedConnected: blockedId => dispatch({ type: UserConstants.BLOCKED_CONNECTED, blockedId: blockedId }),
    blockedDisconnected: blockedId => dispatch({ type: UserConstants.BLOCKED_DISCONNECTED, blockedId: blockedId }),
    removeFriend: (friendId, dialogId) => dispatch({ type: UserConstants.FRIEND_REMOVED, friendId: friendId, dialogId: dialogId }),
    addFriend: (friend, dialog) => dispatch({ type: UserConstants.FRIEND_REQUEST_ACCEPTED, friend: friend, dialog: dialog }),
    friendRequestCanseled: userId => dispatch({ type: UserConstants.FRIEND_REQUEST_CANSELED, userId: userId }),
    requestConnected: userId => dispatch({ type: UserConstants.REQUEST_CONNECTED, userId: userId }),
    requestDisconnected: userId => dispatch({ type: UserConstants.REQUEST_DISCONNECTED, userId: userId }),
    blockUser: (blocked, dialogId) => dispatch({ type: UserConstants.USER_BLOCK, blocked: blocked, dialogId: dialogId }),
    unblockUser: (unblockedId) => dispatch({ type: UserConstants.USER_UNBLOCK, unblockedId: unblockedId }),
    userConnectedToServer: (userId, serverId) => dispatch({ type: serversContainer.USER_CONNECTED_TO_SERVER, userId: userId, serverId: serverId }),
    UserDisconnectedFromServer: (user, serverId) => dispatch({ type: serversContainer.USER_DISCONNECTED_FROM_SERVER, user: user, serverId: serverId }),
    setActiveServer: serverId => dispatch({ type: serversContainer.SET_ACTIVE_SERVER_ID, serverId: serverId }),
    newUserJoinedToServer: (serverId, user) => dispatch({type: serversContainer.NEW_USER_JOINED_TO_SERVER, serverId: serverId, user: user}),
    addFriendRequest: (to, from) => dispatch({ type: UserConstants.ADD_FRIEND_REQUEST, to: to, from: from }),
    addNewServer: server => dispatch({ type: serversContainer.ADD_NEW_SERVER, server: server}),
    addNewRoomInServer: (serverId, room) => dispatch({type: serversContainer.ADD_NEW_ROOM_TO_SERVER, serverId: serverId, room: room}),
    setNewChangesToServer: (serverId, server) => dispatch({ type: serversContainer.SERVER_CHANGED_SETTINGS, serverId: serverId, server: server}),
    removeRoomFromServer: (serverId, roomId) => dispatch({ type: serversContainer.REMOVE_ROOM_FROM_SERVER, serverId: serverId, roomId: roomId}),
    removeServer: serverId => dispatch({ type: serversContainer.REMOVE_SERVER, serverId: serverId}),
    userUnbannedFromServer: (serverId, user) => dispatch({type: serversContainer.USER_UNBANNED_FROM_SERVER, serverId: serverId, user: user}),
    removeUserFromServer: (serverId, userId, myId) => dispatch({type: serversContainer.REMOVE_USER_FROM_SERVER, serverId: serverId, userId: userId, myId: myId}),
    youUnbannedFromServer: server => dispatch({type: serversContainer.YOU_UNBANNED_FROM_SERVER, server: server}),
    adminBanUserFromServer: (serverId, user) => dispatch({type: serversContainer.ADMIN_USER_BANNED_FROM_SERVER, serverId: serverId, user: user}),
    adminRemoveFromBanList: (serverId, user) => dispatch({type: serversContainer.ADMIN_USER_UNBANNED_FROM_SERVER, serverId: serverId, user: user}),
    receiveServerMessage: data => dispatch({ type: serversContainer.RECEIVE_SERVER_ROOM_MESSAGE, data: data }),
    receiveDialogMessage: data => dispatch({ type: homeConstants.RECEIVE_DIALOG_MESSAGE, data: data }),
    setNotification: (variant, message) => dispatch({
      type: NotificationContainer.SET_NOTIFICATION,
      variant: variant,
      message: message
    }),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)