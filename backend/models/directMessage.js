var mongoose = require('mongoose');

var DirectMessageSchema = new mongoose.Schema({
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

DirectMessageSchema.pre('save', function() {
  const date = new Date(Date.now());
  this.time = `${date.getHours()}:${("0"+date.getMinutes()).slice(-2)}`
})

module.exports = mongoose.model('directMessage', DirectMessageSchema, 'directMessage');