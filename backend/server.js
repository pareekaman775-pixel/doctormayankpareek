const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./config/db");

const appointmentRoutes = require("./routes/appointmentRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

const allowedOrigins = [
  process.env.FRONTEND_URL?.trim(),
  "http://localhost:5173",
  "http://localhost:5174",
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin is not allowed by CORS."));
    },
    credentials: true,
  })
);

/*
|--------------------------------------------------------------------------
| JSON
|--------------------------------------------------------------------------
*/

app.use(express.json());


/*
|--------------------------------------------------------------------------
| Root
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
  res.json({
    success: true,
    message:
      "Shree Shyam Dental Care Backend is Running",
  });
});


/*
|--------------------------------------------------------------------------
| Database Test
|--------------------------------------------------------------------------
*/

app.get(
  "/api/test-db",
  async (req, res) => {
    try {
      const [rows] = await pool.query(
        "SELECT 1 AS database_test"
      );

      res.json({
        success: true,
        message:
          "Database connection is working",
        result: rows,
      });
    } catch (error) {
      console.error(
        "Database test error:",
        error.message
      );

      res.status(500).json({
        success: false,
        message:
          "Database connection failed",
      });
    }
  }
);


/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
*/

app.use(
  "/api/auth",
  authRoutes
);


/*
|--------------------------------------------------------------------------
| Appointment Routes
|--------------------------------------------------------------------------
*/

app.use(
  "/api/appointments",
  appointmentRoutes
);


/*
|--------------------------------------------------------------------------
| Server
|--------------------------------------------------------------------------
*/

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(
      `Backend running on http://localhost:${PORT}`
    );
  });
}

module.exports = app;