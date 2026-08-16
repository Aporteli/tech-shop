import mysql from 'mysql2/promise';
import 'dotenv/config';

const db = mysql.createPool({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '',
  database: 'react_projet_tech_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default db;
