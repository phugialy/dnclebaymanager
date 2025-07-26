// Simple logger utility
const getTimestamp = (): string => {
  return new Date().toISOString();
};

const formatMessage = (level: string, message: string, meta?: any): string => {
  const timestamp = getTimestamp();
  let formattedMessage = `${timestamp} [${level.toUpperCase()}]: ${message}`;
  
  if (meta && Object.keys(meta).length > 0) {
    formattedMessage += ` ${JSON.stringify(meta)}`;
  }
  
  return formattedMessage;
};

export const logger = {
  info: (message: string, meta?: any) => {
    console.log(formatMessage('info', message, meta));
  },
  
  error: (message: string, meta?: any) => {
    console.error(formatMessage('error', message, meta));
  },
  
  warn: (message: string, meta?: any) => {
    console.warn(formatMessage('warn', message, meta));
  },
  
  debug: (message: string, meta?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(formatMessage('debug', message, meta));
    }
  }
};

// Export for backward compatibility
export const log = logger; 