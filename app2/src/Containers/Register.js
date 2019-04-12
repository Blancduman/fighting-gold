import React from 'react';
import {
  CssBaseline,
  Paper,
  Typography,
  withStyles
} from '@material-ui/core';
import { connect } from 'react-redux';
import RegisterForm from '../Components/RegisterForm';
import fetch from 'node-fetch';
import { Link } from 'react-router-dom';
import { ServerAddress } from '../Constants';
import { withRouter } from 'react-router';
import { NotificationContainer } from '../Constants';

const styles = theme => ({
  main: {
    width: 'auto',
    display: 'block', // Fix IE 11 issue.
    marginLeft: theme.spacing.unit * 3,
    marginRight: theme.spacing.unit * 3,
    [theme.breakpoints.up(400 + theme.spacing.unit * 3 * 2)]: {
      width: 400,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
  },
  paper: {
    marginTop: theme.spacing.unit * 8,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px ${theme.spacing.unit * 3}px`,
  },
});

class Register extends React.Component {
  constructor(props) {
    super(props);
    this.SignUp = this.SignUp.bind(this);
  }
  SignUp(user) {
    const {push} = this.props.history;
    const { setNotification } = this.props;
    const { username, email, password } = user;
    
    fetch(`${ServerAddress}/api/user/register`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: username, email: email, password: password })
    }).then(function(response) {
      response.json()
        .then(result => {
          if (result.success) {
            push('/login');
            setNotification('success', 'Пользователь успешно создан');
          } else {
            setNotification('error', result.message);
          }
        });
    });
  }

  render() {
    const { classes } = this.props;
    return (
      <main className={classes.main}>
        <CssBaseline />
        <Paper className={classes.paper}>
          <Typography component="h1" variant="h5">
            Registration
          </Typography>
          <RegisterForm signUp={this.SignUp} />

          <Typography>
            Already have an account? <Link to={'/login'}>Login</Link>
          </Typography>
        </Paper>
      </main>
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    setNotification: (variant, message) => dispatch({
      type: NotificationContainer.SET_NOTIFICATION,
      variant: variant,
      message: message
    }),
  }
}

export default withStyles(styles)(connect(null, mapDispatchToProps)(Register));