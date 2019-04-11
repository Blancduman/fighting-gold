import React from 'react';
import {
  CssBaseline,
  Paper,
  Typography,
  withStyles
} from '@material-ui/core';
import LoginForm from '../Components/LoginForm';
import fetch from 'node-fetch';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
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
  avatar: {
    margin: theme.spacing.unit,
    backgroundColor: theme.palette.secondary.main,
  }
});

class Login extends React.Component {
  SignIn(user) {
    const { setNotification } = this.props;
    const { email, password } = user;
    let formData = new FormData({
      email: email,
      password: password
    });
    fetch('http://localhost:8000/api/auth', {
      method: 'post',
      body: formData
    }).then(function(response) {
      response.json()
        .then(result => {
          if (result.success) {
            localStorage.setItem('token', result.token);
            window.location.replace('/');
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
            Login
          </Typography>

          <LoginForm signIn={this.SignIn} />

          <Typography>
            Need an account? <Link to={'/register'}>Registration</Link>
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

export default withStyles(styles)(connect(null, mapDispatchToProps)(Login));