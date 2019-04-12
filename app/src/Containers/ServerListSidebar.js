import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { serversContainer, ServerAddress, NotificationContainer } from '../Constants';
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemIcon,
  Avatar,
  Divider,
  Drawer,
  withStyles
} from '@material-ui/core';
import {
  Add
} from '@material-ui/icons';
import DialogBoxCreateServer from '../Components/DialogBoxCreateServer';
import fetch from 'node-fetch';

const styles = theme => ({
  drawer: {
    width: 90,
    flexShrink: 0,
    overflow: "hidden"
  },
  drawerPaper: {
    width: 90
  }
});

class ServerListSidebar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      openDialog: false,
    }
    this.openDialogCreateServer = this.openDialogCreateServer.bind(this);
    this.closeDialogCreateServer = this.closeDialogCreateServer.bind(this);
    this.createServer = this.createServer.bind(this);
    this.Logout = this.Logout.bind(this);
  }
  Logout() {
    localStorage.removeItem('token');
    window.location.reload();
  }
  openDialogCreateServer() {
    this.setState({
      openDialog: true,
    });
  }
  closeDialogCreateServer() {
    this.setState({
      openDialog: false,
    });
  }
  createServer(serverName) {
    this.closeDialogCreateServer();
    const { setNotification } = this.props;
    fetch(`${ServerAddress}/api/server/create_server`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: localStorage.getItem('token'), serverName: serverName })
    }).then(function(response) {
      response.json()
        .then(result => {
          if (result.success) {
            setNotification('success', 'Сервер успешно создан.');
          } else {
            setNotification('error', result.message);
            if (result.logout) {
              this.Logout();
            }
          }
        });
    });
  }

  render() {
    const { servers, activeServerId, setActiveServerId, user, classes } = this.props;
    return (
      <Drawer
        variant="permanent"
        className={classes.drawer}
        classes={{paper: classes.drawerPaper}}
        anchor="left"
      >
        <List>
          <Link to='/'>
            <ListItem
              button
              selected={false}
              key={''}
              onClick={() => setActiveServerId('')}
            >
                <ListItemAvatar>
                  <Avatar alt={'Home'} src={'/home.png'} />
                </ListItemAvatar>
            </ListItem>
          </Link>
  
          <Divider style={{height: 5}} />
          {
            servers 
            ? servers.map(server => {
                return ( 
                  <ListItem
                    button
                    selected={activeServerId === server._id}
                    key={server._id}
                    onClick={() => setActiveServerId(server._id)}
                  >
                    <Link to={`/server/${server._id}`}>
                      <ListItemAvatar>
                        <Avatar alt={server.name} src={`${ServerAddress}${server.image}`} />
                      </ListItemAvatar>
                    </Link>
                  </ListItem>
                )})
            : <div></div>
          }
          {
            user.isAdmin
            ? <ListItem
                button
                key={'createServer'}
                onClick={this.openDialogCreateServer}
              >
                <ListItemIcon>
                  <Add/>
                </ListItemIcon>
              </ListItem>
            : <div></div>
          }
        </List>
        <DialogBoxCreateServer open={this.state.openDialog} closeDialog={this.closeDialogCreateServer} createServer={this.createServer}/>
      </Drawer>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.userSide.user,
    servers: state.serverSide.servers,
    activeServerId: state.serverSide.activeServerId,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    setNotification: (variant, message) => dispatch({
      type: NotificationContainer.SET_NOTIFICATION,
      variant: variant,
      message: message
    }),
    setActiveServerId: id => dispatch({ type: serversContainer.SET_ACTIVE_SERVER_ID, serverId: id})
  }
}

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(ServerListSidebar));