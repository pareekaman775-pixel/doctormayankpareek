const mysql = require("mysql2/promise");
require("dotenv").config();

const requiredEnv = [
  "DB_HOST",
  "DB_USER",
  "DB_PASSWORD",
  "DB_NAME",
];

const missingEnv = requiredEnv.filter(
  (key) => process.env[key] === undefined
);

if (missingEnv.length > 0) {
  throw new Error(
    `Database is not configured. Missing environment variables: ${missingEnv.join(", ")}`
  );
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;