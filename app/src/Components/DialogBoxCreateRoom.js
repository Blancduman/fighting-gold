import React from 'react';
import {
  Button,
  TextField,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogActions,
  DialogTitle
} from '@material-ui/core';

export default class FormDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: ''
    }
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(value) {
    this.setState({value: value});
  }
  render() {
    const { open, closeDialog, createNewRoom } = this.props;
    
    return (
      <Dialog
        open={open}
        onClose={this.props.closeDialog}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Create room</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To create room, please enter room name.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Room name"
            type="text"
            fullWidth
            onChange={e => this.handleChange(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={() => createNewRoom(this.state.value)} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>  
    );
  }
}