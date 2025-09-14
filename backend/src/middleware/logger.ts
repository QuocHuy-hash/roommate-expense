import express from 'express';

interface LoggerOptions {
  enabled?: boolean;
  detailed?: boolean;
  hideFields?: string[];
}

const defaultOptions: LoggerOptions = {
  enabled: true,
  detailed: process.env.NODE_ENV === 'development',
  hideFields: ['password', 'token', 'accessToken', 'refreshToken']
};

export const requestLogger = (options: LoggerOptions = {}) => {
  const config = { ...defaultOptions, ...options };

  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!config.enabled) {
      return next();
    }

    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.url;
    const userAgent = req.get('User-Agent') || 'Unknown';
    const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'Unknown';
    
    // Basic request log
    console.log(`📥 [${timestamp}] ${method} ${url}`);
    
    if (config.detailed) {
      console.log(`   📍 IP: ${ip}`);
      console.log(`   🌐 User-Agent: ${userAgent.substring(0, 100)}${userAgent.length > 100 ? '...' : ''}`);
      
      // Log request headers (selected ones)
      const importantHeaders = ['content-type', 'authorization', 'x-forwarded-for', 'referer'];
      importantHeaders.forEach(header => {
        const value = req.get(header);
        if (value) {
          let displayValue = value;
          if (header === 'authorization' && value.startsWith('Bearer ')) {
            displayValue = `Bearer ${value.substring(7, 15)}...`;
          }
          console.log(`   📋 ${header}: ${displayValue}`);
        }
      });
      
      // Log request body for POST/PUT/PATCH requests (excluding sensitive data)
      if (['POST', 'PUT', 'PATCH'].includes(method) && req.body && Object.keys(req.body).length > 0) {
        const bodyToLog = { ...req.body };
        // Hide sensitive fields
        config.hideFields?.forEach(field => {
          if (bodyToLog[field]) {
            bodyToLog[field] = '[HIDDEN]';
          }
        });
        console.log(`   📦 Body:`, JSON.stringify(bodyToLog, null, 2));
      }
      
      // Log query parameters if present
      if (Object.keys(req.query).length > 0) {
        console.log(`   🔍 Query:`, req.query);
      }
    }
    
    // Capture start time for response logging
    const startTime = Date.now();
    
    // Store original methods
    const originalJson = res.json;
    const originalSend = res.send;
    const originalEnd = res.end;
    
    // Flag to ensure we only log once
    let logged = false;
    
    const logResponse = () => {
      if (logged) return;
      logged = true;
      
      const duration = Date.now() - startTime;
      const statusCode = res.statusCode;
      const statusEmoji = getStatusEmoji(statusCode);
      
      console.log(`📤 [${new Date().toISOString()}] ${method} ${url} - ${statusEmoji} ${statusCode} (${duration}ms)`);
      
      if (config.detailed) {
        // Log response size if available
        const contentLength = res.get('content-length');
        if (contentLength) {
          console.log(`   📏 Response Size: ${formatBytes(parseInt(contentLength))}`);
        }
      }
      
      console.log('─'.repeat(80));
    };
    
    // Override response methods
    res.json = function(obj: any) {
      logResponse();
      return originalJson.call(this, obj);
    };
    
    res.send = function(obj: any) {
      logResponse();
      return originalSend.call(this, obj);
    };
    
    res.end = function(chunk?: any, encoding?: any, cb?: any) {
      logResponse();
      return originalEnd.call(this, chunk, encoding, cb);
    };
    
    next();
  };
};

// Helper function to get status emoji
function getStatusEmoji(statusCode: number): string {
  if (statusCode >= 200 && statusCode < 300) return '✅';
  if (statusCode >= 300 && statusCode < 400) return '🔄';
  if (statusCode >= 400 && statusCode < 500) return '⚠️';
  if (statusCode >= 500) return '❌';
  return '❓';
}

// Helper function to format bytes
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Simple request counter for statistics
let requestCount = 0;
let errorCount = 0;

export const requestCounter = () => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    requestCount++;
    
    const originalSend = res.send;
    res.send = function(obj: any) {
      if (res.statusCode >= 400) {
        errorCount++;
      }
      return originalSend.call(this, obj);
    };
    
    next();
  };
};

export const getStats = () => ({
  totalRequests: requestCount,
  totalErrors: errorCount,
  errorRate: requestCount > 0 ? ((errorCount / requestCount) * 100).toFixed(2) + '%' : '0%'
});