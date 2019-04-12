module.exports = {
  cors: {
    whitelist: ['http://localhost:3000'],
  },
  database: {
    address: 'mongodb://localhost:27017/sockets_rockets'
  },
  JWT_KEY: 'supersecret',
  port: 8000,

  newAdmin: {
    username: 'Admin',
    email: 'Admin@gmail.com',
    password: '12345'
  }
};