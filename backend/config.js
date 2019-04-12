module.exports = {
  cors: {
    whitelist: ['http://localhost:3000'], // белый список адресов запроса
  },
  database: {
    address: 'mongodb://localhost:27017/sockets_rockets' // адрес базы данных
  },
  JWT_KEY: 'supersecret', // JsonWebToken ключ
  port: 8000, // Порт сервера

  newAdmin: { // заполните эти поля, чтобы создать админа
    username: 'Admin',
    email: 'Admin@gmail.com',
    password: '12345'
  }
};