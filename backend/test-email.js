require("dotenv").config();

const nodemailer = require("nodemailer");

const gmailUser = (process.env.GMAIL_USER || "").trim();
const gmailAppPassword = (process.env.GMAIL_APP_PASSWORD || "")
  .trim()
  .replace(/\s/g, "");

console.log("=================================");
console.log("GMAIL SMTP TEST");
console.log("=================================");
console.log("Gmail User:", gmailUser);
console.log(
  "App Password Length:",
  gmailAppPassword.length
);

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: gmailUser,
    pass: gmailAppPassword,
  },
});

async function testEmail() {
  try {
    console.log("\nChecking SMTP connection...\n");

    await transporter.verify();

    console.log("✅ SMTP AUTHENTICATION SUCCESSFUL");
    console.log("Gmail SMTP is working.");

    console.log("\nSending test email...\n");

    const info = await transporter.sendMail({
      from: `"Shree Shyam Dental Care" <${gmailUser}>`,
      to: "pareekaman775@gmail.com",
      subject: "Shree Shyam Dental Care - SMTP Test",
      text: "This is a test email from Shree Shyam Dental Care.",
    });

    console.log("=================================");
    console.log("✅ EMAIL SENT SUCCESSFULLY");
    console.log("Message ID:", info.messageId);
    console.log("Accepted:", info.accepted);
    console.log("Rejected:", info.rejected);
    console.log("=================================");
  } catch (error) {
    console.log("=================================");
    console.log("❌ SMTP TEST FAILED");
    console.log("=================================");
    console.log("Error:", error.message);
    console.log("Code:", error.code);
    console.log("Command:", error.command);
    console.log("=================================");
  }
}

testEmail();