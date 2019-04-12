var mongoose = require('mongoose'),
    crypto = require('crypto');

var UserSchema = new mongoose.Schema({
  username: {
    type: String,
    index: true,
    unique: true,
    lowercase: true,
    required: [true, "can't be blank."],
    match: [/^[a-zA-Z0-9]+$/, 'Username is invalid.'],
  },
  email: {
    type: String,
    lowercase: true,
    unique: true,
    required: [true, "can't be blank"],
    match: [/\S+@\S+\.\S+/, 'is invalid'],
    index: true
  },
  image: {
    type: String,
    default: '/default_user.png'
  },
  hash: String,
  salt: String,
  status: {
    type: String,
    default: 'Offline'
  },
  dialogs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'dialog'
  }],
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  }],
  servers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'server',
  }],
  blocked: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  }],
  requests: [{
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    }
  }],
  isAdmin: {
    type: Boolean,
    default: false
  }
}, {timestamps: true});



UserSchema.virtual('password')
  .set(function (password) {
    this._plainPassword = password;
    if (password) {
      this.salt = crypto.randomBytes(16).toString('hex');
      this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
    } else {
      this.salt = undefined;
      this.hash = undefined;
    }
  })
  .get(function () {
    return this._plainPassword;
  })

UserSchema.methods.validPassword = function(password) {
  if (!password) return false;
  if (!this.hash) return false;
  return this.hash === crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
};

module.exports = mongoose.model('user', UserSchema, 'user');