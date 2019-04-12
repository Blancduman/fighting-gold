const mongoose = require('mongoose'),
      config = require('./config');

const User = require('./models/user'),
    _Server = require('./models/server');
const newAdmin = async function() {
  console.log(config.newAdmin);
  try {
    const createdAdmin = await User({
      username: config.newAdmin.username,
      email: config.newAdmin.email,
      password: config.newAdmin.password,
      isAdmin: true
    }).save();
    try {
      const [, servers] = await Promise.all([
        _Server.updateMany({}, { $push: { users: createdAdmin } }),
        _Server.find()
      ]);
      try {
        await User.findByIdAndUpdate(createdAdmin.id, { $push: { servers: { $each: servers } } });
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
}
mongoose.connect(config.database.address, {useNewUrlParser: true}, (err) => {
  if (err) throw err;
  newAdmin().then(() => mongoose.disconnect());
});
