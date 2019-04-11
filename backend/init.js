const express = require('express'),
      bodyParser = require('body-parser'),
      app = express(),
      mongoose = require('mongoose'),
      path = require('path'),
      http = require('http').Server(app)
      io = module.exports.io = require('socket.io')(http),
      jwt = require('jsonwebtoken'),
      cors = require('cors'),
      socketioJwt = require('socketio-jwt'),
      uploadImg = require('./middleware/multer'),
      config = require('./config');

const User = require('./models/user'),
    _Server = require('./models/server');

try {
  const createdAdmin = await User({
    username: firstLaunch.username,
    email: firstLaunch.email,
    password: firstLaunch.password,
    isAdmin: true
  }).save();
  try {
    const [, servers] = await Promise.all([
      _Server.updateMany({}, { $push: { users: createdAdmin } }),
      _Server.find()
    ]);
    try {
      await User.findByIdAndUpdate(createdAdmin.id, { $push: { servers: { $each: servers } } });
      if (servers) {
        for (const server of servers) {
          io.toString(`Server-${server.id}`).emit('User_ConnectedToServer', {
            serverId: server.id,
            user: {
              _id: createdAdmin.id,
              username: createdAdmin.username,
              status: createdAdmin.status,
              image: createdAdmin.image
            }
          })
        }
      }
      console.log('Успех');
    } catch (error) {
      console.log(error);
    }
  } catch (error) {
    console.log(error);
  }
} catch (error) {
  console.log(error);
}