const mysql = require("mysql2/promise");

const requiredVariables = [
  "DB_HOST",
  "DB_USER",
  "DB_PASSWORD",
  "DB_NAME",
];
const missingVariables = requiredVariables.filter(
  (name) => !Object.prototype.hasOwnProperty.call(process.env, name)
);

if (missingVariables.length > 0) {
  throw new Error(
    `Missing required database environment variables: ${missingVariables.join(", ")}`
  );
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const testDatabaseConnection = async () => {
  try {
    const connection = await pool.getConnection();

    console.log("MySQL Database Connected Successfully");

    connection.release();
  } catch (error) {
    console.error("MySQL Connection Failed:");
    console.error(error.message);
  }
};

testDatabaseConnection();

module.exports = pool;