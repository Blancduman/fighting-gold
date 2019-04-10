var mongoose = require('mongoose');

var RoomMessageSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  value: {
    type: String
  },
  time: {
    type: String
  }
}, {timestamps: true});

RoomMessageSchema.pre('save', function() {
  const date = new Date(Date.now());
  this.time = `${date.getHours()}:${("0"+date.getMinutes()).slice(-2)}`
})

module.exports = mongoose.model('roomMessage', RoomMessageSchema, 'roomMessage');