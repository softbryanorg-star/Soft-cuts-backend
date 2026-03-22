
import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const sendMessage = async (to, message) => {
  try {
    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to,
      body: message,
    });
  } catch (error) {
    console.error("WhatsApp error:", error.message);
  }
};