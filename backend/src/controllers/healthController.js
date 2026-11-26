import mongoose from 'mongoose';

const DB_STATES = {
0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

export const getHealthStatus = (req, res) => {
  const dbState = DB_STATES[mongoose.connection.readyState] || 'unknown';

  res.status(200).json({
    success: true,
    message: 'WasteWise API is running',
    environment: process.env.NODE_ENV || 'development',
    uptimeInSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    database: {
      status: dbState,
      name: mongoose.connection.name || null,
    },
  });
};