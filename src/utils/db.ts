// db.js

import { ConnectionPool } from 'mssql';

const config = {
  server: "localhost",
  user: "admin",
  password: "admin",
  database: "PERADILAN",
  options: {
    trustedConnection: true,
    trustServerCertificate: true
  },
};

const pool = new ConnectionPool(config);

export async function executeQuery(query: string) {
  try {
    await pool.connect();
    const result = await pool.query(query);
    return result.recordset;
  } catch (err) {
    console.error('Database error:', err);
    throw err;
  } finally {
    pool.close();
  }
}