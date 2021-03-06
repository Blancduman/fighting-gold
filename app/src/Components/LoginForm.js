import React from 'react';
import { validateLoginForm } from '../helper';
import {
  withStyles,
  FormControl,
  InputLabel,
  Input,
  FormHelperText,
  Button
} from '@material-ui/core';

const styles = theme => ({
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing.unit,
  },
  submit: {
    marginTop: theme.spacing.unit * 3,
  },
});

class LoginForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      user: {
        email: 'test1@gmail.com',
        password: '12345',
      },
      error: {
        email: '',
        password: '',
      }
    }

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.signIn(this.state.user);
  }

  handleChange(e) {
    const { name, value } = e.target;
    this.setState({
      user: {
        ...this.state.user,
        [name]: value,
      }
    }, () => {
      const errors = validateLoginForm(this.state.user);
      this.setState({
        error: errors
      });
    });
  }

  render() {
    const { classes } = this.props;
    return (
      <form className={classes.form} onSubmit={this.handleSubmit}>
        <FormControl margin="normal" required fullWidth>
          <InputLabel htmlFor="email">Email Address</InputLabel>
          <Input id="email" name="email" autoComplete="email" value={this.state.user.email} onChange={this.handleChange} autoFocus />
          <FormHelperText>{this.state.error.email}</FormHelperText>
        </FormControl>
        <FormControl margin="normal" required fullWidth>
          <InputLabel htmlFor="password">Password</InputLabel>
          <Input name="password" type="password" id="password" value={this.state.user.password} onChange={this.handleChange} autoComplete="current-password" />
          <FormHelperText>{this.state.error.password}</FormHelperText>
        </FormControl>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          className={classes.submit}
          disabled={this.state.error.email !== '' || this.state.error.password !== ''}
        >
          Sign in
        </Button>
      </form>
    );
  }
}

export default withStyles(styles)(LoginForm);