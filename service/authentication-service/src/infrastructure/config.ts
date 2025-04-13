// Configuration file for authentication service
export default {
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiry: process.env.JWT_EXPIRES_IN || '1h',
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret-key',
  refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  saltRounds: 10
}; 