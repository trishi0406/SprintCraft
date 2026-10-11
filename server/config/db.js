const dns = require('dns');
const mongoose = require('mongoose');


dns.setServers([
  '8.8.8.8',
  '1.1.1.1'
]);

const connectDB = async () => {
  try {
    console.log('MONGO_URI loaded:', !!process.env.MONGO_URI);

    const conn = await mongoose.connect(
      process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sprintcraft'
    );

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } 
  catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

module.exports = connectDB;

