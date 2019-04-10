const express = require('express'),
      bodyParser = require('body-parser'),
      app = express(),
      mongoose = require('mongoose'),
      path = require('path'),
      http = require('http').Server(app)
      io = require('socket.io')(http),
      jwt = require('jsonwebtoken'),
      cors = require('cors'),
      socketioJwt = require('socketio-jwt'),
      uploadImg = require('./middleware/multer'),
      config = require('./config');

const controllerAuth = require('./controllers/api').auth,
      controllerRegister = require('./controllers/api').register,
      controllerCreate_server = require('./controllers/api').create_server,
      controllerRemove_server = require('./controllers/api').remove_server,
      controllerRemove_room = require('./controllers/api').remove_room,
      controllerEdit_server = require('./controllers/api').edit_server;

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cors({
  origin: function (origin, callback) {
    if (config.cors.whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}));

mongoose.connect(config.database.address, {useNewUrlParser: true});
const User = require('./models/user')
      _Server = require('./models/server'),
      Room = require('./models/room'),
      RoomMessage = require('./models/roomMessage'),
      DirectMessage = require('./models/directMessage'),
      Dialog = require('./models/dialog');

app.post('/api/auth', controllerAuth);
app.post('/api/register', controllerRegister);
app.post('/api/create_server', controllerCreate_server);
app.post('/api/remove_server', controllerRemove_server);
app.post('/api/remove_room', controllerRemove_room);
app.post('/api/edit_server', uploadImg.single('picture'), controllerEdit_server);

http.listen(config.port, () => {
  console.log('server is running');
})