import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import businessRoutes from './routes/businessRoutes.js';
import productRoutes from './routes/productRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// When hosted behind a proxy (Render, Heroku...), this keeps secure cookies and
// rate limiting working correctly.
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// ---------- Global middleware ----------

// Allow ONLY the React frontend, and allow it to send cookies
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser()); // makes req.cookies available

// Uploaded images are served as read-only static files:
//  - no directory listing and no dotfiles
//  - "nosniff" + a CSP that forbids scripts, so a bad file can never run as code
//  - file names are random UUIDs and never change, so browsers may cache them
app.use(
  '/uploads',
  express.static(path.resolve(__dirname, '../uploads'), {
    index: false,
    dotfiles: 'deny',
    maxAge: '7d',
    setHeaders: (res) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox");
    },
  })
);

// ---------- Routes ----------

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the WasteWise API' });
});

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/products', productRoutes);

// ---------- Error handling (must come AFTER routes) ----------
app.use(notFound);
app.use(errorHandler);

export default app;