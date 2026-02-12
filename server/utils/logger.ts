import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { getDb } from '../db';
import { systemLogs } from '../../drizzle/schema';

const logDir = path.join(process.cwd(), 'logs');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Custom format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format (colored)
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Create transports
const transports: winston.transport[] = [
  // Console transport
  new winston.transports.Console({
    format: consoleFormat,
  }),

  // Error log file
  new DailyRotateFile({
    filename: path.join(logDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    maxSize: '20m',
    maxFiles: '14d',
  }),

  // Combined log file
  new DailyRotateFile({
    filename: path.join(logDir, 'combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
  }),
];

// Create logger instance
export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  levels,
  format,
  transports,
  exceptionHandlers: [
    new DailyRotateFile({
      filename: path.join(logDir, 'exceptions-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
    }),
  ],
  rejectionHandlers: [
    new DailyRotateFile({
      filename: path.join(logDir, 'rejections-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
    }),
  ],
});

/**
 * Log to database asynchronously
 * This is called after Winston logs to console/files
 */
async function logToDatabase(
  level: 'error' | 'warn' | 'info' | 'http' | 'debug',
  message: string,
  metadata?: {
    context?: string;
    userId?: number;
    [key: string]: any;
  }
) {
  try {
    const db = await getDb();
    if (!db) return;

    const { context, userId, ...rest } = metadata || {};

    await db.insert(systemLogs).values({
      level,
      message,
      context: context || null,
      metadata: Object.keys(rest).length > 0 ? JSON.stringify(rest) : null,
      userId: userId || null,
    });
  } catch (error) {
    // Don't throw errors from logger to avoid infinite loops
    console.error('Failed to write log to database:', error);
  }
}

// Extend logger with database logging
const originalError = logger.error.bind(logger);
const originalWarn = logger.warn.bind(logger);
const originalInfo = logger.info.bind(logger);

// Override error to also log to database
const enhancedError = (message: any, ...meta: any[]) => {
  const result = originalError(message, ...meta);
  if (typeof message === 'string') {
    logToDatabase('error', message, meta[0]);
  }
  return result;
};

// Override warn to also log to database
const enhancedWarn = (message: any, ...meta: any[]) => {
  const result = originalWarn(message, ...meta);
  if (typeof message === 'string') {
    logToDatabase('warn', message, meta[0]);
  }
  return result;
};

// Override info to also log to database
const enhancedInfo = (message: any, ...meta: any[]) => {
  const result = originalInfo(message, ...meta);
  if (typeof message === 'string') {
    logToDatabase('info', message, meta[0]);
  }
  return result;
};

// Replace logger methods
(logger as any).error = enhancedError;
(logger as any).warn = enhancedWarn;
(logger as any).info = enhancedInfo;

// Create child logger with context
export function createContextLogger(context: string) {
  return logger.child({ context });
}

// HTTP request logger middleware
export function httpLogger(req: any, res: any, next: any) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.http(
      `${req.method} ${req.url} ${res.statusCode} - ${duration}ms`,
      {
        context: 'http',
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration,
      }
    );
  });

  next();
}
