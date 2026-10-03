const express = require("express");

const {
  loginAdmin,
  getCurrentAdmin,
} = require("../controllers/authController");

const requireAdminAuth = require("../middleware/authMiddleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Admin Login
|--------------------------------------------------------------------------
*/

router.post("/login", loginAdmin);

/*
|--------------------------------------------------------------------------
| Current Admin
|--------------------------------------------------------------------------
*/

router.get(
  "/me",
  requireAdminAuth,
  getCurrentAdmin
);

module.exports = router;