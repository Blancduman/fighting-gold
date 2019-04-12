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
  Avatar,
  Divider,
  Slide
} from '@material-ui/core';
import { Clear, Photo } from '@material-ui/icons';
import { ServerAddress } from '../Constants'

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
class FSDialogBoxEditProfile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      email: '',
      password: '',
      image: undefined,
      disableButtonSave: true
    };
    this.handleChange = this.handleChange.bind(this);
  }
  componentWillReceiveProps() {
    this.setState({
      username: this.props.user.username,
      email: this.props.user.email,
      image: undefined,
      password: '',
      disableButtonSave: true
    });
  }
  handleChange(e) {
    const { name, value } = e.target;
    this.setState({
      ...this.state,
      [name]: value,
    }, () => {
      if ( (this.state.username !== this.props.user.username &&  this.state.username !== '')
        || (this.state.email !== this.props.user.email &&  this.state.email !== '')
        || this.state.password !== ''
        ||  typeof this.state.image !== 'undefined' ) {
          this.setState({disableButtonSave: false});
      } else {
        this.setState({disableButtonSave: true});
      }
    }); 
  }
  handleChangeImage(image) {
    this.setState({image: image}, () => {
      if ((this.state.username !== this.props.user.username &&  this.state.username !== '')
      || (this.state.email !== this.props.user.email &&  this.state.email !== '')
      || this.state.password !== ''
      ||  typeof this.state.image !== 'undefined' ) {
        this.setState({disableButtonSave: false});
      } else {
        this.setState({disableButtonSave: true});
      }
    });
    console.log(image);
  }
  render() {
    const { classes, user, closeDialog, saveChanges, logout } = this.props;
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
              {`${user.username} - profile`}
            </Typography>
            <Button disabled={this.state.disableButtonSave} color="inherit" onClick={() => saveChanges(this.state.username, this.state.email, this.state.password, this.state.image)}>
              Save
            </Button>
            <Button color="inherit" onClick={logout}>
              Logout
            </Button>
          </Toolbar>
        </AppBar>
        <DialogContent>
        <div style={{display: 'flex'}}>
          <div style={{display: 'block', width: '20%'}}>
              <Avatar src={`${ServerAddress}${user.image}`} className={classes.avatar} />
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
        </div>
          <div>
          <TextField
            autoFocus
            margin="dense"
            name="username"
            label="Username"
            type="text"
            fullWidth
            value={this.state.username}
            onChange={this.handleChange}
          />
          <Divider />
          <TextField
            autoFocus
            margin="dense"
            name="email"
            label="Email"
            type="email"
            fullWidth
            value={this.state.email}
            onChange={this.handleChange}
          />
          <Divider />
          <TextField
            autoFocus
            margin="dense"
            name="password"
            label="Password"
            type="password"
            fullWidth
            value={this.state.password}
            onChange={this.handleChange}
          />
          <Divider />
          </div>
        </DialogContent>
      </Dialog>
    );
  }
}

export default withStyles(styles)(FSDialogBoxEditProfile);