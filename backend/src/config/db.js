import mongoose from 'mongoose';

global.isMockDB = false;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/url_shortener';
  console.log(`🔌 Attempting to connect to MongoDB at: ${uri.split('@').pop()}...`);

  try {
    // Set a strict connection timeout of 3.5 seconds to handle offline/missing databases instantly
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3500,
      connectTimeoutMS: 3500
    });

    console.log('✅ [Database] MongoDB connected successfully.');
    global.isMockDB = false;
  } catch (error) {
    console.error('❌ [Database] Connection failed:', error.message);
    console.warn('\n⚠️  [Database] MongoDB is offline or unavailable.');
    console.warn('⚡  [Database] FALLING BACK TO HYPER-RESPONSIVE IN-MEMORY MOCK DATABASE (Demo Mode Enabled).');
    console.warn('ℹ️   No analytical data will persist across server restarts.\n');
    global.isMockDB = true;
  }
};
export default connectDB;
