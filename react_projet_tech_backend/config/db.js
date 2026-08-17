import mysql from 'mysql2/promise';
import 'dotenv/config';

function poolConfigFromUrl(databaseUrl) {
  const url = new URL(databaseUrl);
  const sslParam = url.searchParams.get('ssl');
  const isLocal = url.hostname === '127.0.0.1' || url.hostname === 'localhost';

  let ssl = false;
  if (sslParam) {
    try {
      ssl = JSON.parse(sslParam);
    } catch {
      ssl = { rejectUnauthorized: true };
    }
  } else if (!isLocal) {
    ssl = { rejectUnauthorized: true };
  }

  return {
    host: url.hostname,
    port: Number(url.port) || (isLocal ? 3306 : 4000),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.replace(/^\//, '')) || undefined,
    ssl,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  };
}

const poolConfig = process.env.DATABASE_URL
  ? poolConfigFromUrl(process.env.DATABASE_URL)
  : {
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'react_projet_tech_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    };

const db = mysql.createPool(poolConfig);

export default db;
