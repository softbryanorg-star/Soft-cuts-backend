import Booking from "../models/Booking.js";
import twilio from "twilio";

const { MessagingResponse } = twilio.twiml;

// In-memory sessions
const sessions = new Map();

// Pricing
const prices = {
  Haircut: 3000,
  "Beard Trim": 1500,
  "Home Service": 10000,
};

export const handleIncomingMessage = async (req, res) => {
  try {
    const message = req.body.Body?.trim();
    const lower = message?.toLowerCase();
    const from = req.body.From;

    if (!from) {
      return res.sendStatus(400);
    }

    // Create session
    if (!sessions.has(from)) {
      sessions.set(from, {
        step: 0,
      });
    }

    const user = sessions.get(from);

    let reply = "";

    // =========================
    // START
    // =========================

    if (lower === "hi" || lower === "hello") {
      user.step = 1;

      reply = `Welcome to Soft Cuts Barbershop 💈

1. View Services
2. Book Appointment
3. Talk to Human`;

      return sendReply(res, reply);
    }

    // =========================
    // MAIN MENU
    // =========================

    if (user.step === 1) {
      // VIEW SERVICES
      if (lower === "1") {
        reply = `Our Services:

✂️ Haircut — ₦3,000
🧔 Beard Trim — ₦1,500
🏠 Home Service — ₦10,000

Reply 2 to book appointment`;

        return sendReply(res, reply);
      }

      // START BOOKING
      if (lower === "2") {
        user.step = 2;

        reply = "Enter your full name:";

        return sendReply(res, reply);
      }

      // TALK TO HUMAN
      if (lower === "3") {
        reply = "Our barber will contact you shortly 📞";

        return sendReply(res, reply);
      }

      reply = "Reply with 1, 2 or 3.";

      return sendReply(res, reply);
    }

    // =========================
    // NAME
    // =========================

    if (user.step === 2) {
      user.name = message;

      user.step = 3;

      reply = `Choose a service:

1. Haircut
2. Beard Trim
3. Home Service`;

      return sendReply(res, reply);
    }

    // =========================
    // SERVICE
    // =========================

    if (user.step === 3) {
      if (lower === "1") {
        user.service = "Haircut";
      } else if (lower === "2") {
        user.service = "Beard Trim";
      } else if (lower === "3") {
        user.service = "Home Service";
      } else {
        reply = "Reply with 1, 2 or 3.";

        return sendReply(res, reply);
      }

      user.price = prices[user.service];

      user.step = 4;

      reply = "Enter appointment date (e.g. 20 March):";

      return sendReply(res, reply);
    }

    // =========================
    // DATE
    // =========================

    if (user.step === 4) {
      user.date = message;

      user.step = 5;

      reply = "Enter appointment time (e.g. 2PM):";

      return sendReply(res, reply);
    }

    // =========================
    // TIME
    // =========================

    if (user.step === 5) {
      user.time = message;

      user.step = 6;

      reply = `Choose appointment type:

1. Shop Visit
2. Home Service`;

      return sendReply(res, reply);
    }

    // =========================
    // TYPE
    // =========================

    if (user.step === 6) {
      // SHOP VISIT
      if (lower === "1") {
        user.type = "Shop Visit";
        user.address = "N/A";

        user.step = 8;

        reply = `💰 Booking Summary

Name: ${user.name}
Service: ${user.service}
Date: ${user.date}
Time: ${user.time}
Type: ${user.type}

Price: ₦${user.price}

Reply YES to confirm booking`;

        return sendReply(res, reply);
      }

      // HOME SERVICE
      if (lower === "2") {
        user.type = "Home Service";

        user.step = 7;

        reply = "Enter your full address 📍:";

        return sendReply(res, reply);
      }

      reply = "Reply with 1 or 2.";

      return sendReply(res, reply);
    }

    // =========================
    // ADDRESS
    // =========================

    if (user.step === 7) {
      user.address = message;

      user.step = 8;

      reply = `💰 Booking Summary

Name: ${user.name}
Service: ${user.service}
Date: ${user.date}
Time: ${user.time}
Type: ${user.type}
Address: ${user.address}

Price: ₦${user.price}

Reply YES to confirm booking`;

      return sendReply(res, reply);
    }

    // =========================
    // CONFIRMATION
    // =========================

    if (user.step === 8) {
      if (lower === "yes") {
        await Booking.create({
          phone: from,
          name: user.name,
          service: user.service,
          date: user.date,
          time: user.time,
          type: user.type,
          address: user.address,
        });

        reply = `✅ Booking Confirmed!

Name: ${user.name}
Service: ${user.service}
Date: ${user.date}
Time: ${user.time}
Type: ${user.type}
${user.type === "Home Service" ? `Address: ${user.address}` : ""}

Our barber will contact you shortly 🙌`;

        sessions.delete(from);

        return sendReply(res, reply);
      }

      reply = "Reply YES to confirm your booking.";

      return sendReply(res, reply);
    }

    // =========================
    // FALLBACK
    // =========================

    reply = "Type 'Hi' to start booking.";

    return sendReply(res, reply);

  } catch (error) {
    console.error("Controller Error:", error.message);

    return res.sendStatus(500);
  }
};

// =========================
// SEND REPLY
// =========================

function sendReply(res, message) {
  const twiml = new MessagingResponse();

  twiml.message(message);

  res.writeHead(200, {
    "Content-Type": "text/xml",
  });

  res.end(twiml.toString());
}