import React from 'react';
import {
  withStyles,
  Input
} from '@material-ui/core';

const styles = theme => ({
  input: {
    margin: theme.spacing.unit
  }
});

class MessageInput extends React.Component {
  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.sendMessage();
  }

  render() {
    const { classes } = this.props;
    return (
      <form onSubmit={ this.handleSubmit }>
        <Input
          placeholder="Напишите сообщение..."
          className={classes.input}
          inputProps={{'aria-label': 'Description' }}
          onChange={e => this.props.setTypingValue(e.target.value)}
          value={this.props.typing}
          style={{ width: '98%' }}
        />
      </form>
    );
  }
}

export default withStyles(styles)(MessageInput);