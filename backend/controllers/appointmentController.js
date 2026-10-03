const pool = require("../config/db");
const nodemailer = require("nodemailer");

/*
|--------------------------------------------------------------------------
| Gmail Configuration
|--------------------------------------------------------------------------
*/

const gmailUser = (
  process.env.GMAIL_USER || ""
).trim();

const gmailAppPassword = (
  process.env.GMAIL_APP_PASSWORD || ""
).replace(/\s/g, "");

let transporter = null;

if (gmailUser && gmailAppPassword) {
  transporter = nodemailer.createTransport({
    service: "gmail",

    auth: {
      user: gmailUser,
      pass: gmailAppPassword,
    },
  });

  /*
   * Verify Gmail SMTP connection when server starts
   */
  transporter
    .verify()
    .then(() => {
      console.log(
        `Gmail SMTP connection verified: ${gmailUser}`
      );
    })
    .catch((error) => {
      console.error(
        "Gmail SMTP verification failed:",
        error.message
      );
    });
} else {
  console.warn(
    "Gmail is not configured. Check GMAIL_USER and GMAIL_APP_PASSWORD in .env"
  );
}

/*
|--------------------------------------------------------------------------
| Email Helper
|--------------------------------------------------------------------------
*/

const sendAppointmentEmail = async ({
  appointment,
  type,
}) => {
  if (!transporter) {
    console.warn(
      "Email not sent because Gmail transporter is not configured."
    );

    return {
      sent: false,
      reason:
        "Gmail transporter is not configured.",
    };
  }

  const patientName =
    appointment.full_name;

  const patientEmail =
    appointment.email;

  const appointmentDate =
    appointment.appointment_date;

  const appointmentTime =
    appointment.appointment_time;

  const concern =
    appointment.dental_concern;

  const message =
    appointment.message || "";

  /*
   * Email content
   */

  let subject;
  let title;
  let intro;
  let statusText;

  if (type === "CONFIRMED") {
    subject =
      "Appointment Confirmed - Shree Shyam Dental Care";

    title =
      "Your Appointment Has Been Confirmed";

    intro =
      "Your dental appointment request has been confirmed by Shree Shyam Dental Care.";

    statusText = "CONFIRMED";
  } else {
    subject =
      "Appointment Update - Shree Shyam Dental Care";

    title =
      "Appointment Request Update";

    intro =
      "We are sorry to inform you that your requested appointment could not be confirmed at this time.";

    statusText = "REJECTED";
  }

  /*
   * HTML Email
   */

  const html = `
<!DOCTYPE html>

<html>
<head>

  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >

  <title>${subject}</title>

</head>

<body
  style="
    margin:0;
    padding:0;
    background:#f3f9f8;
    font-family:Arial,Helvetica,sans-serif;
    color:#173235;
  "
>

  <div
    style="
      width:100%;
      padding:40px 16px;
      box-sizing:border-box;
    "
  >

    <div
      style="
        max-width:620px;
        margin:0 auto;
        background:#ffffff;
        border-radius:20px;
        overflow:hidden;
        border:1px solid #dfeceb;
        box-shadow:0 15px 40px rgba(20,70,70,0.08);
      "
    >

      <!-- HEADER -->

      <div
        style="
          background:#0f6668;
          padding:30px;
          color:#ffffff;
        "
      >

        <div
          style="
            font-size:12px;
            font-weight:bold;
            letter-spacing:2px;
            text-transform:uppercase;
            opacity:0.9;
          "
        >
          Shree Shyam Dental Care
        </div>

        <div
          style="
            font-size:25px;
            font-weight:700;
            margin-top:9px;
            line-height:1.3;
          "
        >
          ${title}
        </div>

      </div>


      <!-- BODY -->

      <div
        style="
          padding:30px;
        "
      >

        <p
          style="
            margin:0 0 18px;
            font-size:16px;
            line-height:1.7;
          "
        >
          Dear
          <strong>${patientName}</strong>,
        </p>


        <p
          style="
            margin:0 0 25px;
            font-size:15px;
            line-height:1.7;
            color:#526869;
          "
        >
          ${intro}
        </p>


        <!-- STATUS -->

        <div
          style="
            margin-bottom:24px;
            padding:14px 18px;
            border-radius:12px;

            background:${
              type === "CONFIRMED"
                ? "#effaf4"
                : "#fff5f5"
            };

            border:1px solid ${
              type === "CONFIRMED"
                ? "#bfe0d0"
                : "#efcaca"
            };

            color:${
              type === "CONFIRMED"
                ? "#21643e"
                : "#8c3030"
            };

            font-weight:bold;
            font-size:14px;
          "
        >
          Appointment Status:
          ${statusText}
        </div>


        <!-- APPOINTMENT DETAILS -->

        <div
          style="
            border:1px solid #dfeceb;
            border-radius:14px;
            overflow:hidden;
            margin-bottom:24px;
          "
        >

          <div
            style="
              padding:14px 18px;
              background:#f8fcfb;
              font-weight:bold;
              color:#0f6668;
            "
          >
            Appointment Details
          </div>


          <table
            width="100%"
            cellpadding="0"
            cellspacing="0"
            style="
              border-collapse:collapse;
              font-size:14px;
            "
          >

            <tr>

              <td
                style="
                  padding:13px 18px;
                  color:#718687;
                  width:40%;
                  border-top:1px solid #edf3f2;
                "
              >
                Patient
              </td>

              <td
                style="
                  padding:13px 18px;
                  font-weight:bold;
                  border-top:1px solid #edf3f2;
                "
              >
                ${patientName}
              </td>

            </tr>


            <tr>

              <td
                style="
                  padding:13px 18px;
                  color:#718687;
                  border-top:1px solid #edf3f2;
                "
              >
                Date
              </td>

              <td
                style="
                  padding:13px 18px;
                  font-weight:bold;
                  border-top:1px solid #edf3f2;
                "
              >
                ${appointmentDate}
              </td>

            </tr>


            <tr>

              <td
                style="
                  padding:13px 18px;
                  color:#718687;
                  border-top:1px solid #edf3f2;
                "
              >
                Time
              </td>

              <td
                style="
                  padding:13px 18px;
                  font-weight:bold;
                  border-top:1px solid #edf3f2;
                "
              >
                ${appointmentTime}
              </td>

            </tr>


            <tr>

              <td
                style="
                  padding:13px 18px;
                  color:#718687;
                  border-top:1px solid #edf3f2;
                "
              >
                Dental Concern
              </td>

              <td
                style="
                  padding:13px 18px;
                  font-weight:bold;
                  border-top:1px solid #edf3f2;
                "
              >
                ${concern}
              </td>

            </tr>

          </table>

        </div>


        ${
          message
            ? `
              <div
                style="
                  margin-bottom:24px;
                  padding:16px;
                  background:#f8fcfb;
                  border-radius:12px;
                "
              >

                <div
                  style="
                    font-size:12px;
                    font-weight:bold;
                    text-transform:uppercase;
                    letter-spacing:1px;
                    color:#718687;
                    margin-bottom:7px;
                  "
                >
                  Patient Message
                </div>

                <div
                  style="
                    font-size:14px;
                    line-height:1.7;
                    color:#526869;
                  "
                >
                  ${message}
                </div>

              </div>
            `
            : ""
        }


        ${
          type === "CONFIRMED"
            ? `
              <p
                style="
                  margin:0 0 20px;
                  font-size:14px;
                  line-height:1.7;
                  color:#526869;
                "
              >
                Please arrive a few minutes before your
                scheduled appointment time.
              </p>
            `
            : `
              <p
                style="
                  margin:0 0 20px;
                  font-size:14px;
                  line-height:1.7;
                  color:#526869;
                "
              >
                Please contact the clinic if you would
                like to request another appointment time.
              </p>
            `
        }


        <!-- CLINIC DETAILS -->

        <div
          style="
            padding-top:20px;
            border-top:1px solid #e5eeee;
          "
        >

          <div
            style="
              font-size:16px;
              font-weight:bold;
              color:#173235;
            "
          >
            Shree Shyam Dental Care
          </div>

          <div
            style="
              margin-top:6px;
              font-size:13px;
              line-height:1.7;
              color:#718687;
            "
          >
            Moti Bavji Choraha,
            Bhilwara, Rajasthan
          </div>

          <div
            style="
              margin-top:3px;
              font-size:13px;
              color:#718687;
            "
          >
            Phone: 7691082871
          </div>

        </div>

      </div>


      <!-- FOOTER -->

      <div
        style="
          padding:18px 30px;
          background:#f8fcfb;
          border-top:1px solid #e5eeee;
          text-align:center;
          font-size:12px;
          color:#849596;
        "
      >
        This is an automated appointment notification
        from Shree Shyam Dental Care.
      </div>

    </div>

  </div>

</body>
</html>
`;

  /*
   * Send email
   */

  try {
    console.log("");
    console.log(
      "========================================"
    );

    console.log(
      "Preparing appointment email..."
    );

    console.log(
      "From:",
      gmailUser
    );

    console.log(
      "To:",
      patientEmail
    );

    console.log(
      "Type:",
      type
    );

    console.log(
      "Subject:",
      subject
    );

    const mailInfo =
      await transporter.sendMail({
        from:
          `"Shree Shyam Dental Care" <${gmailUser}>`,

        to: patientEmail,

        subject,

        html,
      });

    console.log(
      "EMAIL SENT SUCCESSFULLY"
    );

    console.log(
      "Message ID:",
      mailInfo.messageId
    );

    console.log(
      "Accepted:",
      mailInfo.accepted
    );

    console.log(
      "Rejected:",
      mailInfo.rejected
    );

    console.log(
      "Response:",
      mailInfo.response
    );

    console.log(
      "========================================"
    );

    console.log("");

    return {
      sent: true,
      messageId:
        mailInfo.messageId,
      accepted:
        mailInfo.accepted,
      rejected:
        mailInfo.rejected,
      response:
        mailInfo.response,
    };
  } catch (error) {
    console.error("");
    console.error(
      "========================================"
    );

    console.error(
      "EMAIL SENDING FAILED"
    );

    console.error(
      "Recipient:",
      patientEmail
    );

    console.error(
      "Error:",
      error.message
    );

    console.error(
      "========================================"
    );

    console.error("");

    return {
      sent: false,
      reason: error.message,
    };
  }
};


/*
|--------------------------------------------------------------------------
| CREATE APPOINTMENT
|--------------------------------------------------------------------------
*/

const createAppointment = async (
  req,
  res
) => {
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


    /*
     * Required fields
     */

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
        message:
          "Please fill all required appointment fields.",
      });
    }


    /*
     * Phone validation
     *
     * Accept:
     * 7691082871
     * +91 7691082871
     * +917691082871
     * 91 7691082871
     * 76910 82871
     */

    const rawPhone =
      String(phone).trim();

    let cleanPhone =
      rawPhone.replace(/\D/g, "");


    /*
     * Remove India country code
     */

    if (
      cleanPhone.length === 12 &&
      cleanPhone.startsWith("91")
    ) {
      cleanPhone =
        cleanPhone.slice(2);
    }


    /*
     * Final Indian mobile validation
     */

    if (
      !/^[6-9]\d{9}$/.test(
        cleanPhone
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid 10-digit Indian mobile number.",
      });
    }


    /*
     * Email validation
     */

    const cleanEmail =
      String(email)
        .trim()
        .toLowerCase();

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailRegex.test(
        cleanEmail
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid email address.",
      });
    }


    /*
     * Check confirmed slot
     */

    const [
      existingAppointments,
    ] = await pool.query(
      `
        SELECT id
        FROM appointments
        WHERE appointment_date = ?
          AND appointment_time = ?
          AND status = 'CONFIRMED'
        LIMIT 1
      `,
      [
        appointmentDate,
        appointmentTime,
      ]
    );


    if (
      existingAppointments.length > 0
    ) {
      return res.status(409).json({
        success: false,
        message:
          "This appointment slot is already booked. Please choose another time.",
      });
    }


    /*
     * Insert appointment
     */

    const [
      result,
    ] = await pool.query(
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
        String(
          fullName
        ).trim(),

        cleanPhone,

        cleanEmail,

        appointmentDate,

        appointmentTime,

        String(
          dentalConcern
        ).trim(),

        message
          ? String(
              message
            ).trim()
          : null,
      ]
    );


    /*
     * Success
     */

    return res.status(201).json({
      success: true,

      message:
        "Appointment request submitted successfully.",

      appointmentId:
        result.insertId,

      status:
        "PENDING",
    });
  } catch (error) {
    console.error(
      "Create appointment error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to create appointment.",
    });
  }
};


/*
|--------------------------------------------------------------------------
| GET APPOINTMENTS - ADMIN
|--------------------------------------------------------------------------
*/

const getAppointments = async (
  req,
  res
) => {
  try {
    const {
      status,
    } = req.query;


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


    const params = [];


    /*
     * Optional status filter
     */

    if (
      status &&
      [
        "PENDING",
        "CONFIRMED",
        "REJECTED",
        "CANCELLED",
      ].includes(
        status
      )
    ) {
      query += `
        WHERE status = ?
      `;

      params.push(
        status
      );
    }


    query += `
      ORDER BY created_at DESC
    `;


    const [
      rows,
    ] = await pool.query(
      query,
      params
    );


    return res.status(200).json({
      success: true,
      appointments:
        rows,
    });
  } catch (error) {
    console.error(
      "Get appointments error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch appointments.",
    });
  }
};


/*
|--------------------------------------------------------------------------
| CONFIRM APPOINTMENT - ADMIN
|--------------------------------------------------------------------------
*/

const confirmAppointment = async (
  req,
  res
) => {
  const connection =
    await pool.getConnection();

  try {
    const appointmentId =
      Number(
        req.params.id
      );


    /*
     * Validate ID
     */

    if (
      !Number.isInteger(
        appointmentId
      ) ||
      appointmentId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid appointment ID.",
      });
    }


    /*
     * Start transaction
     */

    await connection.beginTransaction();


    /*
     * Lock appointment row
     */

    const [
      appointments,
    ] = await connection.query(
      `
        SELECT *
        FROM appointments
        WHERE id = ?
        FOR UPDATE
      `,
      [
        appointmentId,
      ]
    );


    /*
     * Appointment not found
     */

    if (
      appointments.length === 0
    ) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message:
          "Appointment not found.",
      });
    }


    const appointment =
      appointments[0];


    /*
     * Already confirmed
     */

    if (
      appointment.status ===
      "CONFIRMED"
    ) {
      await connection.rollback();

      return res.status(409).json({
        success: false,
        message:
          "Appointment is already confirmed.",
      });
    }


    /*
     * Only PENDING can be confirmed
     */

    if (
      appointment.status !==
      "PENDING"
    ) {
      await connection.rollback();

      return res.status(409).json({
        success: false,
        message:
          `Only pending appointments can be confirmed. Current status: ${appointment.status}`,
      });
    }


    /*
     * Check duplicate confirmed slot
     */

    const [
      existingConfirmed,
    ] = await connection.query(
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
        appointmentId,
      ]
    );


    if (
      existingConfirmed.length > 0
    ) {
      await connection.rollback();

      return res.status(409).json({
        success: false,
        message:
          "This time slot has already been confirmed for another patient.",
      });
    }


    /*
     * Update status
     */

    await connection.query(
      `
        UPDATE appointments
        SET
          status = 'CONFIRMED',
          confirmed_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      [
        appointmentId,
      ]
    );


    /*
     * Commit DB change
     */

    await connection.commit();


    /*
     * Send confirmation email
     *
     * Database confirmation is already committed.
     * Email failure will NOT undo appointment confirmation.
     */

    const emailResult =
      await sendAppointmentEmail({
        appointment: {
          ...appointment,
          status:
            "CONFIRMED",
        },

        type:
          "CONFIRMED",
      });


    return res.status(200).json({
      success: true,

      message:
        emailResult.sent
          ? "Appointment confirmed and confirmation email sent."
          : "Appointment confirmed, but confirmation email could not be sent.",

      appointment: {
        ...appointment,
        status:
          "CONFIRMED",
      },

      emailSent:
        emailResult.sent,

      emailDetails:
        emailResult.sent
          ? {
              messageId:
                emailResult.messageId,

              accepted:
                emailResult.accepted,

              rejected:
                emailResult.rejected,

              response:
                emailResult.response,
            }
          : {
              reason:
                emailResult.reason,
            },
    });
  } catch (error) {
    try {
      await connection.rollback();
    } catch {
      // Ignore rollback error
    }


    console.error(
      "Confirm appointment error:",
      error
    );


    return res.status(500).json({
      success: false,
      message:
        "Unable to confirm appointment.",
    });
  } finally {
    connection.release();
  }
};


/*
|--------------------------------------------------------------------------
| REJECT APPOINTMENT - ADMIN
|--------------------------------------------------------------------------
*/

const rejectAppointment = async (
  req,
  res
) => {
  const connection =
    await pool.getConnection();

  try {
    const appointmentId =
      Number(
        req.params.id
      );


    /*
     * Validate ID
     */

    if (
      !Number.isInteger(
        appointmentId
      ) ||
      appointmentId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid appointment ID.",
      });
    }


    /*
     * Start transaction
     */

    await connection.beginTransaction();


    /*
     * Lock appointment
     */

    const [
      appointments,
    ] = await connection.query(
      `
        SELECT *
        FROM appointments
        WHERE id = ?
        FOR UPDATE
      `,
      [
        appointmentId,
      ]
    );


    /*
     * Not found
     */

    if (
      appointments.length === 0
    ) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message:
          "Appointment not found.",
      });
    }


    const appointment =
      appointments[0];


    /*
     * Only pending appointments
     */

    if (
      appointment.status !==
      "PENDING"
    ) {
      await connection.rollback();

      return res.status(409).json({
        success: false,
        message:
          `Only pending appointments can be rejected. Current status: ${appointment.status}`,
      });
    }


    /*
     * Update status
     */

    await connection.query(
      `
        UPDATE appointments
        SET status = 'REJECTED'
        WHERE id = ?
      `,
      [
        appointmentId,
      ]
    );


    /*
     * Commit
     */

    await connection.commit();


    /*
     * Send rejection email
     */

    const emailResult =
      await sendAppointmentEmail({
        appointment: {
          ...appointment,
          status:
            "REJECTED",
        },

        type:
          "REJECTED",
      });


    return res.status(200).json({
      success: true,

      message:
        emailResult.sent
          ? "Appointment rejected and notification email sent."
          : "Appointment rejected, but notification email could not be sent.",

      appointment: {
        ...appointment,
        status:
          "REJECTED",
      },

      emailSent:
        emailResult.sent,

      emailDetails:
        emailResult.sent
          ? {
              messageId:
                emailResult.messageId,

              accepted:
                emailResult.accepted,

              rejected:
                emailResult.rejected,

              response:
                emailResult.response,
            }
          : {
              reason:
                emailResult.reason,
            },
    });
  } catch (error) {
    try {
      await connection.rollback();
    } catch {
      // Ignore rollback error
    }


    console.error(
      "Reject appointment error:",
      error
    );


    return res.status(500).json({
      success: false,
      message:
        "Unable to reject appointment.",
    });
  } finally {
    connection.release();
  }
};


/*
|--------------------------------------------------------------------------
| EXPORTS
|--------------------------------------------------------------------------
*/

module.exports = {
  createAppointment,
  getAppointments,
  confirmAppointment,
  rejectAppointment,
};