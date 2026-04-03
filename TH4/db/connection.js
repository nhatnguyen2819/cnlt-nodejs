const mongoose = require('mongoose');

const uri = "mongodb://nhatnguyen2819:28192005@ac-gb74n9o-shard-00-00.tbqlyrt.mongodb.net:27017,ac-gb74n9o-shard-00-01.tbqlyrt.mongodb.net:27017,ac-gb74n9o-shard-00-02.tbqlyrt.mongodb.net:27017/?ssl=true&replicaSet=atlas-5zww6a-shard-0&authSource=admin&appName=nhatnguyen2819";

const connectDB = async () => {
  try {
    await mongoose.connect(uri);
    console.log('Kết nối MongoDB thành công!');
  } catch (error) {
    console.error('Lỗi kết nối MongoDB:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
