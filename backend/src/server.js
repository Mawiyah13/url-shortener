import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/db.js';

// Load environment variables
dotenv.config();

const port = process.env.PORT || 5000;

// Boot strap DB and Server
const bootServer = async () => {
  // 1. Connect to Database (with automatic fallback to Mock DB memory store if offline)
  await connectDB();

  // 2. Start Listening
  app.listen(port, () => {
    console.log(`🚀 [Server] Active and listening on port: ${port}`);
    console.log(`📡 [API Endpoint] http://localhost:${port}`);
    console.log(`🔗 [Redirect Base] http://localhost:${port}/r/:code`);
    console.log(`⚙️  [Environment] Running in ${process.env.NODE_ENV || 'development'} mode.`);
  });
};

bootServer().catch(err => {
  console.error('💥 [Server] Bootstrapping failed:', err.message);
  process.exit(1);
});
