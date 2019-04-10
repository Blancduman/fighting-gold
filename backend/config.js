module.exports = {
  cors: {
    whitelist: ['http://localhost:3000'],
  },
  database: {
    address: 'mongodb://localhost:27017/sockets_rockets'
  },
  JWT_KEY: 'fighting_gold',
  port: 8000
};