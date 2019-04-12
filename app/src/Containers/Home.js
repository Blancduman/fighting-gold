import React from 'react';
import Chat from '../Components/Chat';
import MessageInput from '../Components/MessageInput';
import ServerListSidebar from './ServerListSidebar';
import DialogList from '../Components/DialogList';
import FriendsTable from '../Components/FriendsTable';
import DialogBoxSelectUser from '../Components/DialogBoxSelectUser';
import FSDialogBoxEditProfile from '../Components/FSDialogBoxEditProfile';
import { connect } from 'react-redux';
import { homeConstants, UserConstants, ServerAddress, SocketEmit, NotificationContainer } from '../Constants';
import {
  Card,
  CardHeader,
  Button
} from '@material-ui/core';
import fetch from 'node-fetch';

class Home extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      open: false,
      selectedUser: {},
      buttons: null,
      openProfileEditor: false,
    }
    this.SaveUserProfileChanges = this.SaveUserProfileChanges.bind(this);
    this.OpenUserProfile = this.OpenUserProfile.bind(this);
    this.CloseUserProfile = this.CloseUserProfile.bind(this);
    this.Logout = this.Logout.bind(this);
    this.SendMessage = this.SendMessage.bind(this);
    this.SelectUserForDialogBox = this.SelectUserForDialogBox.bind(this);
    this.handleRemoveFromBlock = this.handleRemoveFromBlock.bind(this);
    this.handleAcceptFriend = this.handleAcceptFriend.bind(this);
    this.handleCanselFriendRequest = this.handleCanselFriendRequest.bind(this);
    this.handleRemoveFriend = this.handleRemoveFriend.bind(this);
    this.handleBlockUser = this.handleBlockUser.bind(this);
    this.CloseDialogBox = this.CloseDialogBox.bind(this);
  }

  SaveUserProfileChanges(username, email, password, image) {
    this.CloseUserProfile();
    const {setUserUpdates, setNotification} = this.props;
    let formData = new FormData();
    formData.append('token', localStorage.getItem('token'));
    if (username) formData.append('username', username);
    if (email) formData.append('email', email);
    if (password) formData.append('password', password);
    if (image) formData.append('picture', image);
    fetch(`${ServerAddress}/api/user/edit_user`, {
      method: 'post',
      body: formData
    }).then(function(response) {
      response.json()
        .then(result => {
          if (result.success) {
            setUserUpdates(result.user.username, result.user.email, result.user.image)
            setNotification('success', 'Изменения сохранены.');
          } else {
            setNotification('error', result.message);
            if (result.logout) {
              this.Logout();
            }
          }
        })
    });
  }

  OpenUserProfile() {
    this.setState({
      openProfileEditor: true
    });
  }
  CloseUserProfile() {
    this.setState({
      openProfileEditor: false
    });
  }

  Logout() {
    localStorage.removeItem('token');
    window.location.reload();
  }

  SendMessage() {
    const { dialogs, activeDialogId } = this.props;
    const dialog = dialogs.find(dialog => { return dialog._id === activeDialogId });
    if (dialog.typing.length > 0) {
      this.props.socket.emit(SocketEmit.DialogMessage, { dialogId: dialog._id, value: dialog.typing });
      this.props.setDialogTyping('');
    }
  }

  SelectUserForDialogBox() {
    const { dialogs, activeDialogId, user } = this.props;
    const dialog = dialogs.find(dialog => { return dialog._id === activeDialogId });
    var selectedUser = dialog.users[0]._id === user._id ? dialog.users[1] : dialog.users[0];
    var buttons = (
      <div>
        <Button onClick={() => this.handleBlockUser(selectedUser._id)} color="primary">
          Block
        </Button>
        <Button onClick={() => this.handleRemoveFriend(selectedUser._id)} color="primary">
          Remove from friends
        </Button>
      </div>
    );
    this.setState({
      open: true,
      selectedUser: selectedUser,
      buttons: buttons
    });
  }
  
  handleRemoveFromBlock(blockId) {
    const { setNotification } = this.props;
    fetch(`${ServerAddress}/api/user/unblock_user`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: localStorage.getItem('token'), blockedUserId: blockId})
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
        })
    });
  }
  
  handleAcceptFriend(newFriendId) {
    const { setNotification } = this.props;
    fetch(`${ServerAddress}/api/user/accept_request`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: localStorage.getItem('token'), newFriendId: newFriendId})
    }).then(function(response) {
      response.json()
        .then(result => {
          if (result.success) {
            setNotification('success', 'Пользователь добавлен в список друзей.');
          } else {
            setNotification('error', result.message);
            if (result.logout) {
              this.Logout();
            }
          }
        })
    });
  }
  handleCanselFriendRequest(newFriendId) {
    const { setNotification } = this.props;
    fetch(`${ServerAddress}/api/user/cansel_request`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: localStorage.getItem('token'), newFriendId: newFriendId})
    }).then(function(response) {
      response.json()
        .then(result => {
          if (result.success) {
            setNotification('success', 'Пользователь удалён из запросов.');
          } else {
            setNotification('error', result.message);
            if (result.logout) {
              this.Logout();
            }
          }
        })
    });
  }
  handleRemoveFriend(oldFriendId) {
    const { setNotification } = this.props;
    fetch(`${ServerAddress}/api/user/remove_friend`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: localStorage.getItem('token'), oldFriendId: oldFriendId})
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
        })
    });
    this.CloseDialogBox()
  }
  handleBlockUser(blockingUserId) {
    const { setNotification } = this.props;
    fetch(`${ServerAddress}/api/user/block_user`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: localStorage.getItem('token'), blockingUserId: blockingUserId})
    }).then(function(response) {
      response.json()
        .then(result => {
          if (result.success) {
            setNotification('success', 'Пользователь добавлены в чёрный список.');
          } else {
            setNotification('error', result.message);
            if (result.logout) {
              this.Logout();
            }
          }
        })
    });
    this.CloseDialogBox()
  }
  CloseDialogBox() {
    this.setState({
      open: false
    });
  }

  render() {
    const { dialogs, activeDialogId, activeFriendsTableTab, user, friends, blocked, setActiveFriendsTableTab, requests } = this.props;
    let ChatWindow;
    if (dialogs) {
      const dialog = dialogs.find(dialog => { return dialog._id === activeDialogId });
      ChatWindow = 
        dialog ?
          <div style={{ width: '100%' }}>
            <Card style={{ marginBottom: 2, textAlign: 'left', width: '100%' }}>
              <CardHeader onClick={() => this.SelectUserForDialogBox()} style={{ paddingBottom: 17, marginTop: 6 }} title={dialog.users[0]._id === user._id ? dialog.users[1].username : dialog.users[0].username} />
            </Card>
          <div style={{display: 'flex', paddingLeft: 3 }}>  
            <div style={{ width: '100%' }}>
              <Chat messages={dialog.messages} selectUser={this.SelectUserForDialogBox} />
              <MessageInput
                setTypingValue={this.props.setDialogTyping}
                sendMessage={this.SendMessage}
                typing={dialog.typing}
              />
            </div>
          </div>
          <DialogBoxSelectUser open={this.state.open} selectedUser={this.state.selectedUser} handleClose={this.CloseDialogBox} buttons={this.state.buttons}/>
        </div> : <div></div>;
    } else {
      return <div></div>
    }
      
    const FriendsWindow = (
      <FriendsTable unblockUser={this.handleRemoveFromBlock} canselFriendRequest={this.handleCanselFriendRequest} acceptFriend={this.handleAcceptFriend} userId={this.props.user._id} activeFriendsTableTab={activeFriendsTableTab} friends={friends} blocked={blocked} requests={requests}
        setActiveDialog={this.props.setActiveDialogId} setActiveTab={setActiveFriendsTableTab} dialogs={dialogs} />
    );
    return (
        <div style={{display:'inline-flex', width:'100%'}}>
          <ServerListSidebar/>
          <DialogList openUserProfile={this.OpenUserProfile} user={user} dialogs={dialogs} activeDialogId={activeDialogId} setActiveDialog={this.props.setActiveDialogId} />
          { activeDialogId !== ''
            ? ChatWindow
            : FriendsWindow }
          <FSDialogBoxEditProfile saveChanges={this.SaveUserProfileChanges} open={this.state.openProfileEditor} user={user} logout={this.Logout} closeDialog={this.CloseUserProfile}/>
        </div>
    )
  }

}

const mapStateToProps = state => {
  return {
    socket: state.socketSide.socket,
    user: state.userSide.user,
    serverSide: state.serverSide,
    dialogs: state.homeSide.dialogs,
    activeDialogId: state.homeSide.activeDialogId,
    friends: state.userSide.friends,
    blocked: state.userSide.blocked,
    activeFriendsTableTab: state.homeSide.activeFriendsTableTab,
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
    setActiveDialogId: dialogId => dispatch({ type: homeConstants.SET_ACTIVE_DIALOG_ID, dialogId: dialogId }),
    setActiveFriendsTableTab: tab => dispatch({ type: homeConstants.SET_ACTIVE_FRIENDS_TABLE_TAB, tab: tab}),
    setDialogTyping: typing => dispatch({ type: homeConstants.SET_DIALOG_TYPING_VALUE, typing: typing }),
    setUserUpdates: (username, email, image) => dispatch({ type: UserConstants.USER_CHANGED, username: username, email: email, image: image})
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);