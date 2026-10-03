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

const databaseConfigurationError = new Error(
  `Database is not configured. Set backend environment variables: ${missingVariables.join(", ")}`
);

const pool = missingVariables.length === 0
  ? mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,

      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    })
  : {
      async query() {
        throw databaseConfigurationError;
      },
      async getConnection() {
        throw databaseConfigurationError;
      },
    };

const testDatabaseConnection = async () => {
  if (missingVariables.length > 0) {
    console.error(databaseConfigurationError.message);
    return;
  }

  try {
    const connection = await pool.getConnection();

    console.log("MySQL Database Connected Successfully");

    connection.release();
  } catch (error) {
    console.error("MySQL Connection Failed:");
    console.error(error.message);
  }
};

if (missingVariables.length === 0) {
  testDatabaseConnection();
}

module.exports = pool;