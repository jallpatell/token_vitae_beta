import mongoose from 'mongoose';

export const connectMongo = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/token_vitae';
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

mongoose.connection.on('error', err => {
  console.error('MongoDB error:', err);
});

export { mongoose }; 