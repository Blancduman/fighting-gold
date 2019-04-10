var mongoose = require('mongoose');

var ServerSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: [true, "can't be blank"],
    match: [/^[a-zA-Z0-9]+$/, 'is invalid']
  },
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  }],
  blocked: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'server',
  }],
  rooms: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'room',
  }],
  image: {
    type: String,
    default: '/default_server.png'
  },
  activeRoomId: {
    type: String,
    default: ''
  }
}, {timestamps: true});

module.exports = mongoose.model('server', ServerSchema, 'server');