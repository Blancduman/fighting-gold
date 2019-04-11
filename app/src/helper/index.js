export const validateLoginForm = (values) => {
  const errors = {
    email: '',
    password: ''
  };

  const emailRe = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (!values.email) {
    errors.email = 'Email cannot be blank';
  } else if (!emailRe.test(values.email)) {
    errors.email = 'Email is invalid';
  }

  if (!values.password) {
    errors.password = 'Password cannot be blank';
  } else if (values.password.length < 4) {
    errors.password = 'Password cannot be shorter than 4 characters.'
  }

  return errors;
};