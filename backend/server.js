const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./config/db");

const appointmentRoutes = require("./routes/appointmentRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

/* =========================================================
   CORS
========================================================= */

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ],
    methods: [
      "GET",
      "POST",
      "PUT",
      "DELETE",
      "OPTIONS",
    ],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

/* =========================================================
   BODY PARSER
========================================================= */

app.use(express.json());

/* =========================================================
   ROOT
========================================================= */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message:
      "Shree Shyam Dental Care Backend is Running",
  });
});

/* =========================================================
   DATABASE TEST
========================================================= */

app.get("/api/test-db", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT 1 AS database_test"
    );

    return res.status(200).json({
      success: true,
      message: "Database connection is working.",
      result: rows,
    });
  } catch (error) {
    console.error(
      "Database test error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Database connection failed.",
    });
  }
});

/* =========================================================
   AUTH ROUTES
========================================================= */

app.use("/api/auth", authRoutes);

/* =========================================================
   APPOINTMENT ROUTES
========================================================= */

app.use(
  "/api/appointments",
  appointmentRoutes
);

/* =========================================================
   404
========================================================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found.",
  });
});

/* =========================================================
   ERROR HANDLER
========================================================= */

app.use((error, req, res, next) => {
  console.error("Server error:", error);

  res.status(500).json({
    success: false,
    message: "Internal server error.",
  });
});

/* =========================================================
   SERVER
========================================================= */

const PORT = 5000;

app.listen(PORT, () => {
  console.log(
    `Backend running on http://localhost:${PORT}`
  );
});