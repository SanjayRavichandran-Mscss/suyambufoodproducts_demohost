// const mysql = require('mysql2/promise');
// require('dotenv').config();

// const db = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   port: process.env.DB_PORT,
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });

// module.exports = db;








const mysql = require('mysql2/promise');
require('dotenv').config();

let db;

if (process.env.DB_URL) {
  // Use full connection string
  db = mysql.createPool(process.env.DB_URL);
} else {
  // Use individual env variables
  db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
}

module.exports = db;
