import React from 'react';
import { connect } from 'react-redux';
import ServerListSidebar from './ServerListSidebar';
import RoomList from '../Components/RoomList';
import Chat from '../Components/Chat';
import MessageInput from '../Components/MessageInput';
import UserList from '../Components/UserList';
import DialogBoxSelectUser from '../Components/DialogBoxSelectUser';
import FSDialogBoxEditServer from '../Components/FSDialogBoxEditServer';
import DialogBoxCreateRoom from '../Components/DialogBoxCreateRoom';
import { serversContainer, homeConstants, ServerAddress, SocketEmit } from '../Constants';

import {
  Card,
  CardHeader,
  Button
} from '@material-ui/core';

class ServerWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      selectedUser: {},
      buttons: null,
      openNewRoom: false,
      openServerSettings: false,
    }
    this.MoveToDialog = this.MoveToDialog.bind(this);
    this.OpenDialogServerSettings = this.OpenDialogServerSettings.bind(this);
    this.CloseDialogServerSettings = this.CloseDialogServerSettings.bind(this);
    this.SaveNewServerSettings = this.SaveNewServerSettings.bind(this);
    this.RemoveRoomFromServer = this.RemoveRoomFromServer.bind(this);
    this.RemoveServer = this.RemoveServer.bind(this);
    this.OpenDialogCreateRoom = this.OpenDialogCreateRoom.bind(this);
    this.СloseDialogCreateRoom = this.СloseDialogCreateRoom.bind(this);
    this.СreateNewRoom = this.СreateNewRoom.bind(this);
    this.SendMessage = this.SendMessage.bind(this);
    this.SelectUserForDialogBox = this.SelectUserForDialogBox.bind(this);
    this.banUserFromServer = this.banUserFromServer.bind(this);
    this.Logout = this.Logout.bind(this);
    this.unbanUserFromServer = this.unbanUserFromServer.bind(this);
    this.handleCanselFriendRequest = this.handleCanselFriendRequest.bind(this);
    this.handleSendFriendRequest = this.handleSendFriendRequest.bind(this);
    this.handleUnblockUser = this.handleUnblockUser.bind(this);
    this.handleRemoveFriend = this.handleRemoveFriend.bind(this);
    this.handleBlockUser = this.handleBlockUser.bind(this);
    this.closeDialogBox = this.closeDialogBox.bind(this);
  }

  MoveToDialog(friendId) {
    const { push } = this.props.history;
    const {moveToFriendDialog, setActiveServer} = this.props;
    moveToFriendDialog(friendId);
    setActiveServer('');
    this.setState({
      open: false
    });
    push('/');
  }
  OpenDialogServerSettings() {
    this.setState({
      openServerSettings: true,
    });
  }
  CloseDialogServerSettings() {
    this.setState({
      openServerSettings: false,
    })
  }
  SaveNewServerSettings(serverName="", image="") {
    this.СloseDialogServerSettings();
    const { activeServerId } = this.props;
    let formData = new FormData();
    formData.append('token', localStorage.getItem('token'));
    formData.append('serverId', activeServerId);
    if (serverName !== "") formData.append('serverName', serverName);
    if (image!=="" && image!==undefined) formData.append('picture', image);
    fetch(`${ServerAddress}/api/server/edit_server`, {
      method: 'post',
      body: formData
    }).then(function(response) {
      response.json()
        .then(result => {
          if (result.success) {
            setNotification('success', 'Настройки сервера сохранены.');
          } else {
            setNotification('error', result.message);
            if (result.logout) {
              this.Logout();
            }
          }
        });
    });
  }
  RemoveRoomFromServer(roomId) {
    const { servers, activeServerId, setActiveRoomId } = this.props;
    const server = servers.find(server => { return server._id === activeServerId });
    if (server.activeRoomId === roomId){
      setActiveRoomId(server.rooms[0]._id);}
    let formData = new FormData({ 
      token: localStorage.getItem('token'),
      serverId: activeServerId,
      roomId: roomId 
    });
    fetch(`${ServerAddress}/api/server/remove_room`, {
      method: 'post',
      body: formData
    }).then(function(response) {
      response.json()
        .then(result => {
          if (result.success) {
            setNotification('success', 'Комната удалена.');
          } else {
            setNotification('error', result.message);
            if (result.logout) {
              this.Logout();
            }
          }
        });
    });
  }
  RemoveServer(serverId) {
    const { push } = this.props.history;
    const { setActiveServer } = this.props;
    setActiveServer('');
    push('/');
    let formData = new FormData({
      token: localStorage.getItem('token'),
      serverId: serverId
    });
    
    fetch(`${ServerAddress}/api/server/remove_server`, {
      method: 'post',
      body: formData
    }).then(function(response) {
      response.json()
        .then(result => {
          if (result.success) {
            setNotification('success', 'Сервер удалён.');
          } else {
            setNotification('error', result.message);
            if (result.logout) {
              this.Logout();
            }
          }
        });
    });
  }
  OpenDialogCreateRoom() {
    this.setState({
      openNewRoom: true,
    });
  }
  СloseDialogCreateRoom() {
    this.setState({
      openNewRoom: false,
    })
  }
  СreateNewRoom(roomName) {
    this.СloseDialogCreateRoom();
    const { activeServerId } = this.props;
    let formData = new FormData({
      token: localStorage.getItem('token'),
      serverId: activeServerId,
      newRoomName: roomName
    });
    fetch(`${ServerAddress}/api/server/create_room`, {
      method: 'post',
      body: formData
    }).then(function(response) {
      response.json()
        .then(result => {
          if (result.success) {
            setNotification('success', 'Комната создана.');
          } else {
            setNotification('error', result.message);
            if (result.logout) {
              this.Logout();
            }
          }
        });
    });
  }
  componentWillMount() {
    const {servers} = this.props;
    const {push} = this.props.history;
    if (servers && servers.findIndex(server => server._id === this.props.match.params.server_id) !== -1)
      this.props.setActiveServer(this.props.match.params.server_id);
    else push('/');
  }
  SendMessage() {
    const { servers, activeServerId, user } = this.props;
    const server = servers.find(server => { return server._id === activeServerId });
    const room = server.rooms.find(room => { return room._id === server.activeRoomId });
    this.props.socket.emit(SocketEmit.ServerMessage, { server: activeServerId, room: room._id, message: {value: room.typing, author: { _id: user._id, username: user.username }} });
    this.props.setTypingValue('');
  }
  SelectUserForDialogBox(id) {
    const { friends, blocked, user, servers, activeServerId, requests } = this.props;
    var _selectedUser = servers.find(server => { return server._id === activeServerId }).users.find(usr => { return usr._id === id});
    var buttons = null;
    if (_selectedUser._id !== user._id) {
      if (friends.findIndex(friend => { return friend._id === _selectedUser._id }) !== -1) {
        buttons = (
          <div>
            {user.isAdmin ?
            <Button onClick={() => this.banUserFromServer(_selectedUser._id)} color="primary">
              Ban
            </Button> : <div></div>}
            <Button onClick={() => this.handleBlockUser(_selectedUser._id)} color="primary">
              Block
            </Button>
            <Button onClick={() => this.handleRemoveFriend(_selectedUser._id)} color="primary">
              Remove from friends
            </Button>
            <Button onClick={() => this.moveToDialog(_selectedUser._id)} color="primary">
              Send message
            </Button>
          </div>
        )
      } else if (blocked.findIndex(blockedOne => { return blockedOne._id === _selectedUser._id }) !== -1) {
        buttons = (
          <div>
            <Button onClick={() => this.handleUnblockUser(_selectedUser._id)} color="primary">
              Unblock
            </Button>
          </div>
        )
      } else if ((requests.findIndex(request => { return request.from._id === _selectedUser._id}) !== -1)
                  || (requests.findIndex(request => { return request.to._id === _selectedUser._id}) !== -1)) {
        buttons = (
          <div>
            {user.isAdmin ?
            <Button onClick={() => this.banUserFromServer(_selectedUser._id)} color="primary">
              Ban
            </Button> : <div></div>}
            <Button onClick={this.handleBlockUser(_selectedUser._id)} color="primary">
              Block
            </Button>
            <Button onClick={() => this.handleCanselFriendRequest(_selectedUser._id)} color="primary">
              Cansel friend request
            </Button>
          </div>
        )
      } else {
        buttons = (
          <div>
            {user.isAdmin ?
            <Button onClick={() => this.banUserFromServer(_selectedUser._id)} color="primary">
              Ban
            </Button> : <div></div>}
            <Button onClick={() => this.handleBlockUser(_selectedUser._id)} color="primary">
              Block
            </Button>
            <Button onClick={() => this.handleSendFriendRequest(_selectedUser._id)} color="primary" autoFocus>
              Send friend request
            </Button>
          </div>
        )
      }
    }
    this.setState({
      open: true,
      selectedUser: _selectedUser,
      buttons: buttons
    });
  }
  banUserFromServer(userId) {
    this.closeDialogBox();
    const {activeServerId} = this.props;
    let formData = new FormData({ 
      token: localStorage.getItem('token'),
      userId: userId,
      serverId: activeServerId 
    });
    fetch(`${ServerAddress}/api/server/ban_user`, {
      method: 'post',
      body: formData
    }).then(function(response) {
      response.json()
        .then(result => {
          if (result.success) {
            setNotification('success', 'Пользователь забанен.');
          } else {
            setNotification('error', result.message);
            if (result.logout) {
              this.Logout();
            }
          }
        });
    });
  }
  Logout() {
    localStorage.removeItem('token');
    window.location.reload();
  }
  unbanUserFromServer(userId) {
    const {activeServerId} = this.props;
    let formData = new FormData({ 
      token: localStorage.getItem('token'),
      userId: userId,
      serverId: activeServerId 
    });
    fetch(`${ServerAddress}/api/server/unban_user`, {
      method: 'post',
      body: formData
    }).then(function(response) {
      response.json()
        .then(result => {
          if (result.success) {
            setNotification('success', 'Пользователь разбанен.');
          } else {
            setNotification('error', result.message);
            if (result.logout) {
              this.Logout();
            }
          }
        });
    });
    this.closeDialogBox();
  }
  handleCanselFriendRequest(newFriendId) {
    let formData = new FormData({ 
      token: localStorage.getItem('token'),
      newFriendId: newFriendId
    });
    fetch(`${ServerAddress}/api/user/cansel_request`, {
      method: 'post',
      body: formData
    }).then(function(response) {
      response.json()
        .then(result => {
          if (result.success) {
            setNotification('success', 'Запрос отменён.');
          } else {
            setNotification('error', result.message);
            if (result.logout) {
              this.Logout();
            }
          }
        });
    });
    this.setState({
      open: false
    });
  }
  handleSendFriendRequest(newFriendId) {
    let formData = new FormData({ 
      token: localStorage.getItem('token'),
      newFriendId: newFriendId
    });
    fetch(`${ServerAddress}/api/user/send_request`, {
      method: 'post',
      body: formData
    }).then(function(response) {
      response.json()
        .then(result => {
          if (result.success) {
            setNotification('success', 'Запрос отправлен.');
          } else {
            setNotification('error', result.message);
            if (result.logout) {
              this.Logout();
            }
          }
        });
    });
    this.setState({
      open: false
    });
  }
  handleUnblockUser(blockedId) {
    let formData = new FormData({ 
      token: localStorage.getItem('token'),
      blockedUserId: blockedId
    });
    fetch(`${ServerAddress}/api/user/unblock_user`, {
      method: 'post',
      body: formData
    }).then(function(response) {
      response.json()
        .then(result => {
          if (result.success) {
            setNotification('success', 'Пользователь разблокирован.');
          } else {
            setNotification('error', result.message);
            if (result.logout) {
              this.Logout();
            }
          }
        });
    });
    this.setState({
      open: false
    });
  }
  handleRemoveFriend(oldFriendId) {
    let formData = new FormData({ 
      token: localStorage.getItem('token'),
      oldFriendId: oldFriendId
    });
    fetch(`${ServerAddress}/api/user/remove_friend`, {
      method: 'post',
      body: formData
    }).then(function(response) {
      response.json()
        .then(result => {
          if (result.success) {
            setNotification('success', 'Пользователь удалён из друзей.');
          } else {
            setNotification('error', result.message);
            if (result.logout) {
              this.Logout();
            }
          }
        });
    });
    this.setState({
      open: false
    });
  }
  handleBlockUser(blockingUserId) {
    let formData = new FormData({ 
      token: localStorage.getItem('token'),
      blockingUserId: blockingUserId
    });
    fetch(`${ServerAddress}/api/user/block_user`, {
      method: 'post',
      body: formData
    }).then(function(response) {
      response.json()
        .then(result => {
          if (result.success) {
            setNotification('success', 'Пользователь заблокирован.');
          } else {
            setNotification('error', result.message);
            if (result.logout) {
              this.Logout();
            }
          }
        });
    });
    this.setState({
      open: false
    });
  }
  closeDialogBox() {
    this.setState({
      open: false
    });
  }

  render() {
    const { servers, activeServerId, setActiveServer, setActiveRoomId, user } =  this.props;
    const {push} = this.props.history;

    if (servers) {
      var server, room;
      server = servers.find(server => { return server._id === activeServerId });
      if (server) {
        room = server.rooms.find(room => { return room._id === server.activeRoomId });
        if (room) {
          return (
            <div style={{ display: 'inline-flex', width: '100%' }}>
              <ServerListSidebar />
              <RoomList openServerSettings={this.OpenDialogServerSettings} openDialog={this.OpenDialogCreateRoom} user={user} rooms={server.rooms} activeRoomId={server.activeRoomId} setActiveRoomId={setActiveRoomId} serverName={server.name}/>
              <div style={{ width: '100%' }}>
                <Card style={{marginBottom: 2, textAlign: 'left', width: '100%'}}>
                  <CardHeader style={{ paddingBottom: 17, marginTop: 6 }} title={room.name} />
                </Card>
                <div style={{display: 'flex', paddingLeft:3}}>
                  <div style={{width:'80%'}}>
                    <ServerChat messages={room.messages} selectUser={this.SelectUserForDialogBox} />
                    <MessageInput 
                      setTypingValue={this.props.setTypingValue}
                      sendMessage={this.SendMessage}
                      typing={room.typing}
                    />
                  </div>
                  <ServerUserList users={server.users} selectUser={this.SelectUserForDialogBox} />
                </div>
              </div>
              <ResponsiveDialogBox open={this.state.open} selectedUser={this.state.selectedUser} handleClose={this.closeDialogBox} buttons={this.state.buttons} />
            
            {
              user.isAdmin
              ? <div>
                  <FSDialogBoxEditServer servImage={server.image} unbanUser={this.unbanUserFromServer} serverId={server._id} removeServer={this.RemoveServer} removeRoom={this.RemoveRoomFromServer} rooms={server.rooms} serverName={server.name} blocked={server.blocked} closeDialog={this.CloseDialogServerSettings} saveChanges={this.SaveNewServerSettings} open={this.state.openServerSettings}/>
                  <DialogBoxCreateRoom createNewRoom={this.createNewRoom} open={this.state.openNewRoom} closeDialog={this.closeDialogCreateRoom}/>
                </div>
              : <div></div>
            }
          </div>
          )
        } else {
          setActiveRoomId(server.rooms[0]._id);
        }
      } else {
        setActiveServer('');
        push('/');
        return <div></div>
      }
    } else {
      setActiveServer('');
      push('/');
      return <div></div>
    }
  }
}
const mapStateToProps = state => {
  return {
    servers: state.serverSide.servers,
    activeServerId: state.serverSide.activeServerId,
    socket: state.socketSide.socket,
    user: state.userSide.user,
    friends: state.userSide.friends,
    blocked: state.userSide.blocked,
    requests: state.userSide.requests
  }
}

const mapDispatchToProps = dispatch => {
  return {
    setNotification: (variant, message) => dispatch({
      type: NotificationContainer.SET_NOTIFICATION,
      variant: variant,
      message: message
    }),
    setActiveRoomId: roomId => dispatch({ type: serversContainer.SET_ACTIVE_ROOM_ID, roomId: roomId }),
    setTypingValue: typing => dispatch({ type: serversContainer.SET_TYPING_VALUE, typing: typing }),
    setActiveServer: serverId => dispatch({ type: serversContainer.SET_ACTIVE_SERVER_ID, serverId: serverId }),
    moveToFriendDialog: friendId => dispatch({type: homeConstants.MOVE_TO_FRIEND_DIALOG, friendId: friendId}),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ServerWrapper);