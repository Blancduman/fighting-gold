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

const controllerAuth = require('./controllers/api').auth,
      controllerRegister = require('./controllers/api').register,
      controllerCreate_server = require('./controllers/api').create_server,
      controllerCreate_room = require('./controllers/api').create_room,
      controllerRemove_server = require('./controllers/api').remove_server,
      controllerRemove_room = require('./controllers/api').remove_room,
      controllerAccept_request = require('./controllers/api').accept_request,
      controllerCansel_request = require('./controllers/api').cansel_request,
      controllerEdit_server = require('./controllers/api').edit_server,
      controllerEdit_user = require('./controllers/api').edit_user,
      controllerSend_request = require('./controllers/api').send_request,
      controllerBlock_user = require('./controllers/api').block_user,
      controllerRemove_friend = require('./controllers/api').remove_friend,
      controllerUnblock_user = require('./controllers/api').unblock_user;

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

app.post('/api/user/auth', controllerAuth);
app.post('/api/user/register', controllerRegister);
app.post('/api/user/edit_user', uploadImg.single('picture'), controllerEdit_user);
app.post('/api/user/block_user', controllerBlock_user);
app.post('/api/user/unblock_user', controllerUnblock_user);
app.post('/api/user/send_request', controllerSend_request);
app.post('/api/user/remove_friend', controllerRemove_friend);
app.post('/api/user/cansel_request', controllerCansel_request);
app.post('/api/user/accept_request', controllerAccept_request);
app.post('/api/server/create_server', controllerCreate_server);
app.post('/api/server/create_room', controllerCreate_room),
app.post('/api/server/remove_server', controllerRemove_server);
app.post('/api/server/remove_room', controllerRemove_room);
app.post('/api/server/edit_server', uploadImg.single('picture'), controllerEdit_server);


http.listen(config.port, () => {
  console.log('server is running');
})