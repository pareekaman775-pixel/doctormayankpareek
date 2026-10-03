const jwt = require("jsonwebtoken");

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const adminEmail = (process.env.ADMIN_EMAIL || "")
      .trim()
      .toLowerCase();

    const adminPassword = process.env.ADMIN_PASSWORD || "";
    const jwtSecret = process.env.JWT_SECRET || "";

    if (!adminEmail || !adminPassword || !jwtSecret) {
      return res.status(500).json({
        success: false,
        message:
          "Admin authentication is not configured on the server.",
      });
    }

    if (
      email.trim().toLowerCase() !== adminEmail ||
      password !== adminPassword
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin email or password.",
      });
    }

    const token = jwt.sign(
      {
        role: "ADMIN",
        email: adminEmail,
      },
      jwtSecret,
      {
        expiresIn: "8h",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Admin login successful.",
      token,
      admin: {
        email: adminEmail,
        role: "ADMIN",
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to login admin.",
    });
  }
};

const getCurrentAdmin = (req, res) => {
  return res.status(200).json({
    success: true,
    admin: req.admin,
  });
};

module.exports = {
  loginAdmin,
  getCurrentAdmin,
};