var mongoose = require('mongoose');

var dialogSchema = new mongoose.Schema({
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  }],
  messages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'directMessage',
  }],
  typing: {
    type: String,
    default: ''
  }
}, {timestamps: true});

module.exports = mongoose.model('dialog', dialogSchema, 'dialog');