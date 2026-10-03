const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "shree_shyam_dental",

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