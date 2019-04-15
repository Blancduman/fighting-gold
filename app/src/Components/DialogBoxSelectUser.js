import React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  withMobileDialog,
  Avatar
} from '@material-ui/core';
import { Clear } from '@material-ui/icons';
import { ServerAddress } from '../Constants'

class DialogBoxSelectUser extends React.Component {
  render() {
    const { selectedUser, buttons } = this.props;
    if (selectedUser)
      return (
      <Dialog
        maxWidth="sm"
        open={this.props.open}
        onClose={this.props.handleClose}
        aria-labelledby="responsive-dialog-title"
      >
        
        <DialogTitle id="responsive-dialog-title">
        <div style={{display: 'flex', float: 'left', alignItems: 'center', justifyContent: 'center' }}> 
        <Avatar src={`${ServerAddress}${selectedUser.image}`} style={{margin: 10, width: 64, height: 64}} />{selectedUser.username}
        </div>
        <IconButton style={{float: 'right'}} color="inherit" onClick={this.props.handleClose} aria-label="Close">
          <Clear />
        </IconButton>
        </DialogTitle>
        
        <DialogContent>
          <DialogContentText>
            {selectedUser.status}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          {buttons}
        </DialogActions>
      </Dialog>
    );
    else return <div></div>
  }
}

export default withMobileDialog()(DialogBoxSelectUser);