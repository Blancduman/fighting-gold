import React from 'react';
import {
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Typography,
  withStyles,
  List
} from '@material-ui/core';
import { ServerAddress } from '../Constants';

const styles = theme => ({
  root: {
    width: '100%',
    backgroundColor: theme.palette.background.paper,
  },
  inline: {
    display: 'inline',
  }
});

class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.chatRef = React.createRef();
    this.scrollToBottom = this.scrollToBottom.bind(this);
  }
  componentDidMount() {
    this.scrollToBottom();
  }
  componentDidUpdate() {
    this.scrollToBottom();
  }

  scrollToBottom() {
    this.chatRef.current.scrollTop = this.chatRef.current.scrollHeight;
  }

  render() {
    const { classes, messages } = this.props;
    return (
      <div style={{width:'100%', overflowY:'scroll', height:'87vh'}} ref={this.chatRef}>
        <List className={classes.root}>
          {
              messages
            ? messages.map(msg => {
                return (
                  <ListItem key={msg._id} alignItems="flex-start" style={{border: '2px #eee solid', borderRadius: 50, marginBottom: 2, marginTop: 2}}>
                  
                  <ListItemAvatar>
                    <Avatar alt={msg.author.username} src={`${ServerAddress}${msg.author.image}`} />
                  </ListItemAvatar>
          
                  <ListItemText
                    onClick={() => this.props.selectUser(msg.author._id)}
                    primary={msg.author.username}
                    secondary={
                      <React.Fragment>
                        {`${msg.time} `}
                        <Typography component="span" className={classes.inline} color="textPrimary">
                        {msg.value}
                        </Typography>
                      </React.Fragment>
                    }
                  />
                </ListItem>
                );
              })
            : <div></div>
          }
        </List>
      </div>
    );
  }
}

export default withStyles(styles)(Chat);