var mongoose = require('mongoose');

var RoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "can't be blank"],
    match: [/^[a-zA-Z0-9]+$/, 'is invalid']
  },
  messages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'roomMessage',
  }],
  typing: {
    type: String,
    default: ''
  }
}, {timestamps: true});

module.exports = mongoose.model('room', RoomSchema, 'room');