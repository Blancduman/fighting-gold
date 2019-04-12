import React from 'react';
import {
  Button,
  TextField,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  DialogTitle
} from '@material-ui/core';
import { Clear } from '@material-ui/icons';

export default class DialogBoxCreateServer extends React.Component {
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
    const { open, closeDialog, createServer } = this.props;
    
    return (
      <Dialog
        open={open}
        onClose={closeDialog}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">
          Create server
          <IconButton style={{float: 'right'}} color="inherit" onClick={closeDialog} aria-label="Close">
            <Clear />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Название сервера:
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Server name"
            type="text"
            fullWidth
            onChange={e => this.handleChange(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} color="primary">
            Отмена
          </Button>
          <Button onClick={() => createServer(this.state.value)} color="primary">
            Создать
          </Button>
        </DialogActions>
      </Dialog>  
    );
  }
}