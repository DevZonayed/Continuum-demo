export const config = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  dbPath: process.env.DB_PATH || './data/db.json',
};
