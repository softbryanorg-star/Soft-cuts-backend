import Booking from "../models/Booking.js";
import twilio from "twilio";

const { MessagingResponse } = twilio.twiml;

// In-memory session (MVP)
const sessions = new Map();

export const handleIncomingMessage = async (req, res) => {
  try {
    const message = req.body.Body?.trim().toLowerCase();
    const from = req.body.From;

    if (!from) {
      return res.sendStatus(400);
    }

    if (!sessions.has(from)) {
      sessions.set(from, { step: 0 });
    }

    const user = sessions.get(from);
    let reply = "";

    // START
    if (message === "hi" || message === "hello") {
      user.step = 1;
      reply = `Welcome to Soft Cuts Barbershop 💈

1. View Services
2. Book Appointment`;
    }

    // SERVICES
    else if (message === "1") {
      reply = `Our Services:

✂️ Haircut - ₦3,000
🧔 Beard Trim - ₦1,500
🏠 Home Service - ₦10,000

Reply 2 to book`;
    }

    // START BOOKING
    else if (message === "2") {
      user.step = 2;
      reply = "Enter service (Haircut / Beard / Home):";
    }

    // SERVICE INPUT
    else if (user.step === 2) {
      user.service = message;
      user.step = 3;
      reply = "Enter date (e.g. 20 March):";
    }

    // DATE INPUT
    else if (user.step === 3) {
      user.date = message;
      user.step = 4;
      reply = "Enter time (e.g. 2pm):";
    }

    // FINAL STEP → SAVE TO DB
    else if (user.step === 4) {
      user.time = message;

      await Booking.create({
        phone: from,
        service: user.service,
        date: user.date,
        time: user.time,
      });

      reply = `✅ Booking Confirmed!

Service: ${user.service}
Date: ${user.date}
Time: ${user.time}

You’re booked 🙌`;

      sessions.delete(from);
    }

    else {
      reply = "Type 'Hi' to start booking.";
    }

    const twiml = new MessagingResponse();
    twiml.message(reply);

    res.writeHead(200, { "Content-Type": "text/xml" });
    res.end(twiml.toString());

  } catch (error) {
    console.error("Controller error:", error.message);
    res.sendStatus(500);
  }
};