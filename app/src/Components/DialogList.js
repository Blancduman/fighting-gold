import React from 'react';
import {
  withStyles,
  Input,
  Button,
  List,
  ListSubheader,
  Paper,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Typography,
} from '@material-ui/core';
import { ServerAddress } from '../Constants';

const styles = theme => ({
  drawer: {
    width: 90,
    flexShrink: 0,
    overflow: "hidden",
  },
  drawer1: {
    [theme.breakpoints.up('sm')]: {
      width: 260,
      flexShrink: 0,
    },
    overflow: "hidden",
  },
  drawerPaper: {
    width: 90,
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  input: {
    margin: theme.spacing.unit
  },
  root1: {
    width: 260,
    maxWidth: 260,
    backgroundColor: theme.palette.background.paper,
  },
  root: {
    display: 'flex',
  },
  button: {
    margin: theme.spacing.unit,
  }
});

const mergeSort = (function () {
  function merger(array, start, end) {
      if (Math.abs(end - start) <= 1) {
          return [];
      }
      const middle = Math.ceil((start + end) / 2);

      merger(array, start, middle);
      merger(array, middle, end);

      return merge(array, start, middle, end);
  }

  function merge(array, start, middle, end) {
    const left = [],
          right = [],
          leftSize = middle - start,
          rightSize = end - middle,
          maxSize = Math.max(leftSize, rightSize),
          size = end - start,
          i = 0;

      for (i = 0; i < maxSize; i += 1) {
          if (i < leftSize) {
              left[i] = array[start + i];
          }
          if (i < rightSize) {
              right[i] = array[middle + i];
          }
      }
      i = 0;
      while (i < size) {
          if (left.length && right.length) {
              if (left[0].createdAt >= right[0].createdAt) {
                  array[start + i] = right.shift();
              } else {
                  array[start + i] = left.shift();
              }
          } else if (left.length) {
              array[start + i] = left.shift();
          } else {
              array[start + i] = right.shift();
          }
          i += 1;
      }
      return array;
  }
  return function (array) {
      return merger(array, 0, array.length);
  }

}());

function DialogList(props) {
  const {openUserProfile, user, dialogs, activeDialogId, setActiveDialog, classes} = props;
  const dialogList = dialogs
  ? mergeSort(dialogs).map(dialog => {
      let author = dialog.users[0]._id === user._id ? dialog.users[1] : dialog.users[0];
      if (dialog.messages.length > 0) {
        let lastMessage = dialog.messages[dialog.messages.length - 1];
        let text = lastMessage.value.length > 30 ? `${lastMessage.value.substring(0, 30).trim()}...` : lastMessage.value;
        return (
          <ListItem
            button
            alignItems='flex-start'
            selected={dialog._id === activeDialogId}
            onClick={() => setActiveDialog(dialog._id)}
            key={dialog._id}
          >
            <ListItemAvatar>
              <Avatar alt={lastMessage.author.username} src={`${ServerAddress}${author.image}`} />
            </ListItemAvatar>
            <ListItemText
              primary={author.username}
              secondary={
                <React.Fragment>
                  <Typography component="span" color="textPrimary">
                    {`${lastMessage.time} `}
                  </Typography>
                  {author._id === user._id ?`You: ${text}`:text}
                </React.Fragment>
              }
            />
          </ListItem>
        )}
        return (
          <ListItem
            button
            alignItems='flex-start'
            selected={dialog._id === activeDialogId}
            onClick={() => setActiveDialog(dialog._id)}
            key={dialog._id}
          >

            <ListItemAvatar>
              <Avatar src={`${serverAddress}${author.image}`} />
            </ListItemAvatar>

            <ListItemText
              primary={author.username}
              secondary={
                <React.Fragment>
                  {'0 messages...'}
                </React.Fragment>
              }
            />

          </ListItem>
        )
    })
  : <div></div>
  return (
    <Paper style={{height: '99vh', overflow: 'auto', overflowX:'hidden', minWidth:260}}>

      <nav className={classes.drawer1}>

        <div className={classes.container}>

          <Input
            placeholder="Find"
            className={classes.input}
            inputProps={{'aria-label': 'Description'}}
            style={{width: 230}}
          />

        </div>

        <Button
          variant="contained"
          color="primary"
          className={classes.button}
          style={{width: 240}}
          onClick={() => setActiveDialog('')}
        >
          Friends
        </Button>
        <Button
          variant="contained"
          color="primary"
          className={classes.button}
          style={{width: 240}}
          onClick={openUserProfile}
        >
          Settings
        </Button>

        <List className={classes.root1}>

          <ListSubheader component='div' style={{float: 'left'}}>Direct Messages</ListSubheader>
          
          {dialogList}
          
        </List>
      </nav>
    </Paper>
  )
};

export default withStyles(styles)(DialogList);