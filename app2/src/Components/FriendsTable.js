import React from 'react';
import PropTypes from 'prop-types';
import classesName from 'classnames';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  ListItemText,
  ListItemAvatar,
  ListItem,
  withStyles,
  AppBar,
  Tabs,
  Tab,
  Typography,
  IconButton
} from '@material-ui/core';
import {
  Check,
  Clear
} from '@material-ui/icons'
import { ServerAddress } from '../Constants';

const styles = theme => ({
  root: {
    width: '100%',
    overflowX: 'auto',
    maxHeight: '90vh'
  },
  table: {
    minWidth: '100%',
  },
  tableRow: {
    cursor: 'pointer',
  },
  tableRowHover: {
    '&:hover': {
      backgroundColor: theme.palette.grey[200],
    },
  },
  margin: {
    margin: theme.spacing.unit,
  },
});

function FriendsTable({unblockUser, canselFriendRequest, acceptFriend, userId, friendStatus, requests, classes, friends, blocked, setActiveDialog}) {
  let ListUsers;

  switch (friendStatus) {
    case 'Online': {
      if (friends)
      ListUsers = friends.map(friend => {
        if (friend.status === 'Online') {
          return (
            <TableRow key={friend._id} className={classesName(classes.tableRow, classes.tableRowHover)}
              onClick={(e) => { e.preventDefault(); setActiveDialog(friend._id) }}
            >
  
              <TableCell component="th" scope="row">
  
                <ListItem alignItems='flex-start'>
  
                  <ListItemAvatar>  
                    <Avatar alt={friend.username} src={`${ServerAddress}${friend.image}`} />
                  </ListItemAvatar>
  
                  <ListItemText primary={friend.username} />
  
                </ListItem>
  
              </TableCell>
              
              <TableCell align="right">
                {friend.status}
              </TableCell>
  
            </TableRow>
          );
        }
      });
      break;
    }
    case 'Pending': {
      if (requests)
        ListUsers = requests.map(request => {
          console.log(request);
          if (request.from._id === userId) {
            return (
              <TableRow key={request.to._id} className={classesName(classes.tableRow, classes.tableRowHover)}
                onClick={(e) => { e.preventDefault(); }}
              >
    
                <TableCell component="th" scope="row">
    
                  <ListItem alignItems='flex-start'>
    
                    <ListItemAvatar>  
                      <Avatar alt={request.to.username} src={`${ServerAddress}${request.to.image}`} />
                    </ListItemAvatar>
    
                    <ListItemText primary={request.to.username} />
    
                  </ListItem>
    
                </TableCell>
                <TableCell align="right">
                  <IconButton aria-label="Refuse" className={classes.margin} onClick={() => canselFriendRequest(request.to._id)}>
                    <Clear />
                  </IconButton>
                </TableCell>
                
                <TableCell align="right">
                  {request.to.status}
                </TableCell>
    
              </TableRow>
            );
        } else {
          return (
            <TableRow key={request.from._id} className={classesName(classes.tableRow, classes.tableRowHover)}
              onClick={(e) => { e.preventDefault(); }}
            >
  
              <TableCell component="th" scope="row">
  
                <ListItem alignItems='flex-start'>
  
                  <ListItemAvatar>  
                    <Avatar alt={request.from.username} src={`${ServerAddress}${request.from.image}`} />
                  </ListItemAvatar>
  
                  <ListItemText primary={request.from.username} />
  
                </ListItem>
  
              </TableCell>
              <TableCell align="right">
                <IconButton aria-label="Accept" className={classes.margin} onClick={() => acceptFriend(request.from._id)}>
                  <Check />
                </IconButton>
                <IconButton aria-label="Refuse" className={classes.margin} onClick={() => canselFriendRequest(request.from._id)}>
                  <Clear />
                </IconButton>
              </TableCell>
              <TableCell align="right">
                {request.from.status}
              </TableCell>
  
            </TableRow>
          );
        }
      });
      break;
    }
    case 'Blocked': {
      if (blocked)
      ListUsers = blocked.map(blockOne => {

        return (
          <TableRow key={blockOne._id}>

            <TableCell component="th" scope="row">

              <ListItem alignItems='flex-start'>

                <ListItemAvatar>  
                  <Avatar alt={blockOne.username} src={`${ServerAddress}${blockOne.image}`} />
                </ListItemAvatar>

                <ListItemText primary={blockOne.username} />

              </ListItem>

            </TableCell>
            <TableCell align="right">
              <IconButton aria-label="Remove" className={classes.margin} onClick={() => unblockUser(blockOne._id)}>
                <Clear />
              </IconButton>
            </TableCell>            
            
            <TableCell align="right">
              {blockOne.status}
            </TableCell>

          </TableRow>
        );
      });
      break;
    }

    default: {
      if (friends)
      ListUsers = friends.map(friend => {
        return (
          <TableRow key={friend._id} className={classesName(classes.tableRow, classes.tableRowHover)}
            onClick={(e) => { e.preventDefault(); setActiveDialog(friend._id) }}
          >

            <TableCell component="th" scope="row">

              <ListItem alignItems='flex-start'>

                <ListItemAvatar>  
                  <Avatar alt={friend.username} src={`${ServerAddress}${friend.image}`} />
                </ListItemAvatar>

                <ListItemText primary={friend.username} />

              </ListItem>

            </TableCell>
            
            <TableCell align="right">
              {friend.status}
            </TableCell>

          </TableRow>
        );
      });
      break;
    }
  }
  return (
    <Paper className={classes.root}>

      <Table className={classes.table}>

        <TableHead>

          <TableRow>
            <TableCell>Friends</TableCell>
            {friendStatus === 'Pending' && <TableCell align="right">Action</TableCell>}
            {friendStatus === 'Blocked' && <TableCell align="right">Unblock?</TableCell>}
            <TableCell align="right">Status</TableCell>
          </TableRow>

        </TableHead>

        <TableBody>
          {ListUsers}
        </TableBody>

      </Table>
      
    </Paper>
  ); 
}

FriendsTable.propTypes = {
  classes: PropTypes.object.isRequired,
};

const TableFriends = withStyles(styles)(FriendsTable);

function TabContainer(props) {
  return (

    <Typography component="div" style={{ padding: 8 * 3 }}>
      {props.children}
    </Typography>

  );
}

TabContainer.propTypes = {
  children: PropTypes.node.isRequired,
};

const styles1 = theme => ({
  root: {
    flexGrow: 1,
    width: '100%',
    backgroundColor: theme.palette.background.paper,
  },
});

function FriendsBar(props) {
  const { unblockUser, canselFriendRequest, acceptFriend, userId, requests, activeFriendsTableTab, friends, blocked, setActiveDialog, setActiveTab, classes, dialogs} = props;
  function handleChange(event, value) {
    setActiveTab(value);
  }
  function handleSelectDialog(id) {
    setActiveDialog(
      dialogs.find(dialog => { return dialog.users.find(_user => _user._id === id)})._id
    )
  }
  return (

    <div className={classes.root}>

      <AppBar position="relative" color="default">

        <Tabs
          value={activeFriendsTableTab}
          onChange={handleChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >

          <Tab label="All" />
          <Tab label="Online" />
          <Tab label="Pending" />
          <Tab label="Blocked" />

        </Tabs>

      </AppBar>

      {activeFriendsTableTab === 0 && <TabContainer><TableFriends setActiveDialog={handleSelectDialog} friends={friends} friendStatus={'All'}/></TabContainer>}
      {activeFriendsTableTab === 1 && <TabContainer><TableFriends setActiveDialog={handleSelectDialog} friends={friends} friendStatus={'Online'}/></TabContainer>}
      {activeFriendsTableTab === 2 && <TabContainer><TableFriends setActiveDialog={handleSelectDialog} requests={requests} userId={userId} friendStatus={'Pending'} acceptFriend={acceptFriend} canselFriendRequest={canselFriendRequest}/></TabContainer>}
      {activeFriendsTableTab === 3 && <TabContainer><TableFriends blocked={blocked} unblockUser={unblockUser} friendStatus={'Blocked'}/></TabContainer>}
      
    </div>
  );
};

FriendsBar.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles1)(FriendsBar);