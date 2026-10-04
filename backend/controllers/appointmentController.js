const pool = require("../config/db");

/* =========================================================
   HELPERS
========================================================= */

const normalizePhone = (phone = "") => {
  let digits = String(phone).replace(/\D/g, "");

  // +91XXXXXXXXXX / 91XXXXXXXXXX
  if (digits.length === 12 && digits.startsWith("91")) {
    digits = digits.slice(2);
  }

  return digits;
};

const isValidIndianPhone = (phone) => {
  const normalized = normalizePhone(phone);
  return /^[6-9]\d{9}$/.test(normalized);
};

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/* =========================================================
   CREATE APPOINTMENT
   PUBLIC ROUTE
========================================================= */

const createAppointment = async (req, res) => {
  try {
    const {
      fullName,
      phone,
      email,
      appointmentDate,
      appointmentTime,
      dentalConcern,
      message,
    } = req.body;

    /* -------------------------
       REQUIRED FIELD VALIDATION
    ------------------------- */

    if (
      !fullName ||
      !phone ||
      !email ||
      !appointmentDate ||
      !appointmentTime ||
      !dentalConcern
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required appointment fields.",
      });
    }

    /* -------------------------
       PHONE VALIDATION
    ------------------------- */

    const normalizedPhone = normalizePhone(phone);

    if (!isValidIndianPhone(normalizedPhone)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 10-digit Indian mobile number.",
      });
    }

    /* -------------------------
       EMAIL VALIDATION
    ------------------------- */

    const normalizedEmail = String(email).trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    /* -------------------------
       CHECK DATE/TIME SLOT
    ------------------------- */

    const [existingAppointments] = await pool.query(
      `
      SELECT id
      FROM appointments
      WHERE appointment_date = ?
      AND appointment_time = ?
      AND status = 'CONFIRMED'
      LIMIT 1
      `,
      [appointmentDate, appointmentTime]
    );

    if (existingAppointments.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "This appointment slot is already confirmed. Please select another time.",
      });
    }

    /* -------------------------
       INSERT APPOINTMENT
    ------------------------- */

    const [result] = await pool.query(
      `
      INSERT INTO appointments
      (
        full_name,
        phone,
        email,
        appointment_date,
        appointment_time,
        dental_concern,
        message,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING')
      `,
      [
        String(fullName).trim(),
        normalizedPhone,
        normalizedEmail,
        appointmentDate,
        appointmentTime,
        String(dentalConcern).trim(),
        message ? String(message).trim() : null,
      ]
    );

    /* -------------------------
       RESPONSE
    ------------------------- */

    return res.status(201).json({
      success: true,
      message:
        "Appointment request submitted successfully. The clinic will review your request.",
      appointment: {
        id: result.insertId,
        status: "PENDING",
      },
    });
  } catch (error) {
    console.error("Create appointment error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to submit appointment request.",
    });
  }
};

/* =========================================================
   GET ALL APPOINTMENTS
   ADMIN ONLY
========================================================= */

const getAppointments = async (req, res) => {
  try {
    const { status } = req.query;

    let query = `
      SELECT
        id,
        full_name,
        phone,
        email,
        appointment_date,
        appointment_time,
        dental_concern,
        message,
        status,
        created_at,
        confirmed_at
      FROM appointments
    `;

    const values = [];

    if (status) {
      query += ` WHERE status = ? `;
      values.push(status);
    }

    query += `
      ORDER BY created_at DESC
    `;

    const [appointments] = await pool.query(
      query,
      values
    );

    return res.status(200).json({
      success: true,
      appointments,
    });
  } catch (error) {
    console.error("Get appointments error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch appointments.",
    });
  }
};

/* =========================================================
   CONFIRM APPOINTMENT
   ADMIN ONLY
========================================================= */

const confirmAppointment = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;

    await connection.beginTransaction();

    /* -------------------------
       FIND APPOINTMENT
    ------------------------- */

    const [rows] = await connection.query(
      `
      SELECT *
      FROM appointments
      WHERE id = ?
      FOR UPDATE
      `,
      [id]
    );

    if (rows.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Appointment not found.",
      });
    }

    const appointment = rows[0];

    /* -------------------------
       STATUS CHECK
    ------------------------- */

    if (appointment.status !== "PENDING") {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message:
          `This appointment is already ${appointment.status.toLowerCase()}.`,
      });
    }

    /* -------------------------
       CHECK CONFIRMED SLOT
    ------------------------- */

    const [existingConfirmed] = await connection.query(
      `
      SELECT id
      FROM appointments
      WHERE appointment_date = ?
      AND appointment_time = ?
      AND status = 'CONFIRMED'
      AND id != ?
      LIMIT 1
      `,
      [
        appointment.appointment_date,
        appointment.appointment_time,
        id,
      ]
    );

    if (existingConfirmed.length > 0) {
      await connection.rollback();

      return res.status(409).json({
        success: false,
        message:
          "Another appointment is already confirmed for this date and time.",
      });
    }

    /* -------------------------
       UPDATE STATUS
    ------------------------- */

    await connection.query(
      `
      UPDATE appointments
      SET
        status = 'CONFIRMED',
        confirmed_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [id]
    );

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: "Appointment confirmed successfully.",
      appointment: {
        id: Number(id),
        status: "CONFIRMED",
      },
    });
  } catch (error) {
    await connection.rollback();

    console.error("Confirm appointment error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to confirm appointment.",
    });
  } finally {
    connection.release();
  }
};

/* =========================================================
   REJECT APPOINTMENT
   ADMIN ONLY
========================================================= */

const rejectAppointment = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { id } = req.params;

    await connection.beginTransaction();

    /* -------------------------
       FIND APPOINTMENT
    ------------------------- */

    const [rows] = await connection.query(
      `
      SELECT *
      FROM appointments
      WHERE id = ?
      FOR UPDATE
      `,
      [id]
    );

    if (rows.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Appointment not found.",
      });
    }

    const appointment = rows[0];

    /* -------------------------
       STATUS CHECK
    ------------------------- */

    if (appointment.status !== "PENDING") {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message:
          `This appointment is already ${appointment.status.toLowerCase()}.`,
      });
    }

    /* -------------------------
       UPDATE STATUS
    ------------------------- */

    await connection.query(
      `
      UPDATE appointments
      SET
        status = 'REJECTED'
      WHERE id = ?
      `,
      [id]
    );

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: "Appointment rejected successfully.",
      appointment: {
        id: Number(id),
        status: "REJECTED",
      },
    });
  } catch (error) {
    await connection.rollback();

    console.error("Reject appointment error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to reject appointment.",
    });
  } finally {
    connection.release();
  }
};

/* =========================================================
   EXPORT
========================================================= */

module.exports = {
  createAppointment,
  getAppointments,
  confirmAppointment,
  rejectAppointment,
};