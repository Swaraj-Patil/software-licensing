import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Load Swagger document
const swaggerDocument = JSON.parse(fs.readFileSync(join(__dirname, 'swagger.json'), 'utf8'));

// API Documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Import route handlers
import issueHandler from './api/issue/route.js';
import validateHandler from './api/validate/route.js';
import deactivateHandler from './api/deactivate/route.js';

// Routes
app.use('/api/issue', (req, res) => issueHandler(req, res));
app.use('/api/validate', (req, res) => validateHandler(req, res));
app.use('/api/deactivate', (req, res) => deactivateHandler(req, res));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Root path handler
app.get('/', (req, res) => {
  res.redirect('/docs');
});

// Start server (only in non-Vercel environment)
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
    console.log(`API documentation available at http://localhost:${port}/docs`);
  });
}

// Export for Vercel
export default app;
