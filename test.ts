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

async function run() {
  const pool = new ConnectionPool(config);
  
  try {
    await pool.connect();
    const result = await pool.query('SELECT * FROM HAKIM');
    console.log(JSON.stringify(result));
  } catch (err) {
    console.error('Database error:', err);
    throw err;
  } finally {
    pool.close();
  }
}

run();
