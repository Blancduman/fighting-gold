module.exports = {
  cors: {
    whitelist: ['http://localhost:8080'],
  },
  database: {
    address: 'mongodb://localhost:27017/sockets_rockets'
  },
  JWT_KEY: 'fighting_gold',
  port: 8000,

  firstLaunch: {
    username: 'Admin',
    email: 'Admin@gmail.com',
    password: '12345'
  }
};