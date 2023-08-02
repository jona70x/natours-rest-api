const dotenv = require('dotenv');
const mongoose = require('mongoose');

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('Uncaught rejection, shutting down');
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

// MongoDB
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose.connect(DB).then((con) => {
  console.log('DB connection established');
});

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running at port ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('Unhandled rejection, shutting down');
  server.close(() => {
    process.exit(1);
  });
});
