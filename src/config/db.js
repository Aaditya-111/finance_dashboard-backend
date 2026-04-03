const { Pool } = require('pg');
const { databaseUrl } = require('./env');

const pool = new Pool({
  connectionString: databaseUrl,
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected database error', err);
  process.exit(-1);
});

module.exports = pool;