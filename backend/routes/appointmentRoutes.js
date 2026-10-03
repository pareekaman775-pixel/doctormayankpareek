const express = require("express");

const {
  createAppointment,
  getAppointments,
  confirmAppointment,
  rejectAppointment,
} = require("../controllers/appointmentController");

const router = express.Router();


// Create appointment
router.post("/", createAppointment);


// Get all appointments
router.get("/", getAppointments);


// Confirm appointment
router.put("/:id/confirm", confirmAppointment);


// Reject appointment
router.put("/:id/reject", rejectAppointment);


module.exports = router;