// This import MUST stay first: it loads the .env variables
// before any other file tries to read them.
import 'dotenv/config';

import app from './src/app.js';
import connectDB from './src/config/db.js';
import { startExpiryJob } from './src/services/expiryService.js';

// Stop immediately if important settings are missing
const REQUIRED_ENV = ['MONGO_URI', 'JWT_SECRET', 'CLIENT_URL'];
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(`❌ Missing environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

if (process.env.JWT_SECRET.length < 32) {
  console.error('❌ JWT_SECRET must be at least 32 characters. See the Phase 3 instructions.');
  process.exit(1);
}

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 WasteWise server running on http://localhost:${PORT}`);
    console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
  });

  startExpiryJob(); // marks overdue products as expired every 5 minutes
};

startServer();