import React from 'react';
import {
  withStyles,
  Card,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  Button,
  ListItemIcon,
  ListSubheader,
  Divider,
  Paper
} from '@material-ui/core';
import {
  Add
} from '@material-ui/icons';

const styles = theme => ({
  root: {
    width: 260,
    backgroundColor: theme.palette.background.paper,
  },
  inline: {
    display: 'inline',
  },
  card: {
    maxWidth: 260,
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  button: {
    margin: theme.spacing.unit,
  },
  drawer1: {
    [theme.breakpoints.up('sm')]: {
      width: 260,
      flexShrink: 0,
    },
    overflow: "hidden",
  },
});

class RoomList extends React.Component {
  render() {
    const { rooms, activeRoomId, setActiveRoomId, serverName, user, openDialog, openServerSettings, classes } = this.props;
    return (
      <Paper style={{ overflow: 'auto', overflowX:'hidden', minWidth:'260px', height: '99vh'}}>
        <nav className={classes.drawer1} style={{paddingBottom: 7}}>
          <Card className={classes.card} style={{paddingBottom: 6}}>
            <CardHeader title={serverName.length > 18 ? `${serverName.substring(0,16).trim()}...` : serverName} />
          </Card>
        </nav>
        <List className={classes.root}>
          <Divider />
          {user.isAdmin?<Button
            variant="contained"
            color="primary"
            className={classes.button}
            style={{width: 240}}
            onClick={openServerSettings}
          >
            Server Settings
        </Button>:<div></div>}
          <Divider />
          <ListSubheader component="div" style={{float: 'left'}}>Rooms</ListSubheader>
          {
            rooms.map(room => {
              return (
                <ListItem
                  key={room._id}
                  button
                  onClick={() => setActiveRoomId(room._id)}
                  selected={activeRoomId === room._id}
                >
                  <ListItemText primary={room.name.length > 24 ? `${room.name.substring(0,25).trim()}...` : room.name} />
                </ListItem>
              )
            })
          }
          { user.isAdmin ?
            <ListItem
              key='create-room'
              button
              onClick={openDialog}
            >
              <ListItemText primary={
                <ListItemIcon>
                  <Add />
                </ListItemIcon>
              }/>
            </ListItem>
            :<div></div>
          }
        </List>
      </Paper>
    );
  }
}

export default withStyles(styles)(RoomList);