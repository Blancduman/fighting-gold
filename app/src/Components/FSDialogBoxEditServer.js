import React from 'react';
import {
  withStyles,
  Button,
  Dialog,
  DialogContent,
  TextField,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  ListItemSecondaryAction,
  List,
  ListSubheader,
  ListItem,
  ListItemText,
  Avatar,
  Slide
} from '@material-ui/core';
import { Delete, Clear, Photo } from '@material-ui/icons';
import { ServerAddress } from '../Constants';
const styles = {
  appBar: {
    position: 'relative',
  },
  flex: {
    flex: 1,
  },
  input: {
    display: 'none'
  },
  avatar: {
    margin: 10,
    width: 200,
    height: 200,
  },
};

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

class FSDialogBoxEditServer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      image: undefined,
      disableButtonSave: true
    }
  }
  componentWillReceiveProps() {
    this.setState({
      value: this.props.serverName,
      image: undefined,
      disableButtonSave: true
    });
  }
  handleChange(value) {
    this.setState({value: value}, () => {
      if ((this.state.value !== this.props.serverName
      &&  this.state.value !== '')
      ||  typeof this.state.image !== 'undefined') {
        this.setState({disableButtonSave: false});
      } else {
        this.setState({disableButtonSave: true});
      }
    });
  }
  handleChangeImage(image) {
    this.setState({image: image}, () => {
      if ((this.state.value !== this.props.serverName
        &&  this.state.value !== '')
      ||  typeof this.state.image !== 'undefined') {
        this.setState({disableButtonSave: false});
      } else {
        this.setState({disableButtonSave: true});
      }
    });
    console.log(image);
  }
  render() {
    const { classes, servImage, unbanUser, rooms, serverName, serverId, blocked, closeDialog, removeRoom, removeServer, saveChanges } = this.props;
    const roomList = rooms.map(room => {
      return (
        <ListItem alignItems="flex-start" key={room._id}>
          <ListItemText primary={room.name}/>
          <ListItemSecondaryAction>
          <IconButton aria-label="Remove" className={classes.margin} onClick={() => removeRoom(room._id)}>
            <Delete />
          </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      )
    });
    const blockedList = blocked.map(blockedOne => {
      return (
        <ListItem alignItems="flex-start" key={blockedOne._id}>
          <ListItemText primary={blockedOne.username}/>
          <ListItemSecondaryAction>
          <IconButton aria-label="Remove" className={classes.margin} onClick={() => unbanUser(blockedOne._id)}>
            <Delete />
          </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
    )
    });
    return (
      <Dialog
        fullScreen
        open={this.props.open}
        onClose={this.props.handleClose}
        TransitionComponent={Transition}
      >
        <AppBar className={classes.appBar}>
          <Toolbar>
            <IconButton color="inherit" onClick={closeDialog} aria-label="Close">
              <Clear />
            </IconButton>
            <Typography variant="h6" color="inherit" className={classes.flex}>
              {`${serverName} - Edit`}
            </Typography>
            <Button disabled={this.state.disableButtonSave} color="inherit" onClick={() => {saveChanges(this.state.value, this.state.image); this.setState({value: '', image: null})}}>
              Save
            </Button>
            <Button color="inherit" onClick={() => removeServer(serverId)}>
              Delete
            </Button>
          </Toolbar>
        </AppBar>
        <DialogContent>
            
        <div style={{display: 'flex'}}>
          <div style={{display: 'block', width: '20%'}}>
              <Avatar src={`${ServerAddress}${servImage}`} className={classes.avatar} />
              <input
                accept="image/jpeg, image/png"
                className={classes.input}
                onChange={e => this.handleChangeImage(e.target.files[0])}
                id="uploadimage"
                type="file"
              />
              <label htmlFor="uploadimage">
                <IconButton color="primary" component="span">
                  Upload
                  <Photo/>
                </IconButton>
              </label>
            </div>
          <TextField
            autoFocus
            margin="dense"
            id="serverName"
            label="Server name"
            type="text"
            fullWidth
            onChange={e => this.handleChange(e.target.value)}
          />
        </div>
        <div style={{display:'flex'}}>
        <List>
          <ListSubheader component="div">Room</ListSubheader>
          {roomList}
        </List>
        <List>
          <ListSubheader component="div">Banned users</ListSubheader>
          {blockedList}
        </List>
        </div>
        </DialogContent>
      </Dialog>
    );
  }
}
export default withStyles(styles)(FSDialogBoxEditServer);