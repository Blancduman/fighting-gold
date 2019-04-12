import React from 'react';
import {
  withStyles,
  List,
  ListSubheader,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Paper
} from '@material-ui/core';
import { ServerAddress } from '../Constants'

const styles = theme => ({
  root: {
    width: 320,
    maxWidth: 320,
    backgroundColor: theme.palette.background.paper,
    padding: 5,
    overflow: 'hidden'
  },
  drawer: {
    [theme.breakpoints.up('sm')]: {
      width: 320,
      flexShrink: 0,
    },
    overflowX: "hidden",
    overflow: 'auto'
  },
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
          i=0;

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
              if (left[0].username >= right[0].username) {
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

function ServerUserList(props) {
  const { users, classes, selectUser } = props;
  if (users) {
    const online = users.map(user => {
      if (user.status === 'Online')
        return (
          <ListItem
            onClick={() => selectUser(user._id)}
            button
            alignItems='flex-start'
            key={user._id}
          >
            <ListItemAvatar>
              <Avatar alt={user.username} src={`${ServerAddress}${user.image}`} />
            </ListItemAvatar>
            <ListItemText
              primary={user.username}
            />
          </ListItem>
        )
    });
    const offline = users.map(user => {
      if (user.status === 'Offline')
        return (
          <ListItem
            onClick={() => selectUser(user._id)}
            button
            alignItems='flex-start'
            key={user._id}
          >
            <ListItemAvatar>
              <Avatar alt={user.username} src={`${ServerAddress}${user.image}`} />
            </ListItemAvatar>
            <ListItemText
              primary={user.username}
            />
          </ListItem>
        )
    });
    return (
      <Paper style={{height: '92vh', overflow: 'auto', float: 'left', overflowX:'hidden', width:'320px'}}>
      <nav className={classes.drawer}>
        <List className={classes.root}>
          <ListSubheader component='div'>Online</ListSubheader>
          {online}
          <ListSubheader component='div'>Offline</ListSubheader>
          {offline}
        </List>
      </nav>
    </Paper>
    )
  } else {
    return <div></div>
  }
}

export default withStyles(styles)(ServerUserList);