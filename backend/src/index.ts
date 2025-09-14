import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import swaggerSpecs from './swagger.js';
import authRoutes from './routes/auth.js';
import expenseRoutes from './routes/expenses.js';
import settlementRoutes from './routes/settlements.js';
import { requestLogger, requestCounter, getStats } from './middleware/logger.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request logging and counting middleware
app.use(requestCounter());
app.use(requestLogger({
  enabled: process.env.DISABLE_LOGGING !== 'true',
  detailed: process.env.NODE_ENV === 'development' || process.env.DETAILED_LOGGING === 'true',
  hideFields: ['password', 'token', 'accessToken', 'refreshToken']
}));

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     description: Check if the API is running properly
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 */
// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

/**
 * @swagger
 * /stats:
 *   get:
 *     summary: Server statistics
 *     description: Get request statistics and server info
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server statistics
 */
// Stats endpoint
app.get('/stats', (req, res) => {
  const stats = getStats();
  res.json({
    ...stats,
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'RoomMate Expense API',
  swaggerOptions: {
    persistAuthorization: true,
  },
}));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/settlements', settlementRoutes);

// Global error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀'.repeat(3) + ' SERVER STARTED ' + '🚀'.repeat(3));
  console.log(`📊 Port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
  console.log(`� Server stats: http://localhost:${PORT}/stats`);
  
  // Logging configuration info
  const loggingEnabled = process.env.DISABLE_LOGGING !== 'true';
  const detailedLogging = process.env.NODE_ENV === 'development' || process.env.DETAILED_LOGGING === 'true';
  
  console.log(`📝 Request Logging: ${loggingEnabled ? '✅ Enabled' : '❌ Disabled'}`);
  console.log(`🔍 Detailed Logging: ${detailedLogging ? '✅ Enabled' : '❌ Disabled'}`);
  
  if (loggingEnabled) {
    console.log('💡 Tip: Set DISABLE_LOGGING=true to disable request logging');
    console.log('💡 Tip: Set DETAILED_LOGGING=true to enable detailed logging in production');
  }
  
  console.log('═'.repeat(80));
});
