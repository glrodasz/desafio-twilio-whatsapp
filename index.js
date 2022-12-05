import express from "express";
import * as dotenv from "dotenv";

dotenv.config();

const {
  PORT,
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_SERVICE_SID,
  TWILIO_SANDBOX_PHONE,
} = process.env;

const app = express();
app.use(express.json());

import twilio from "twilio";
const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

app.post("/verify/:phoneNumber", async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    const verification = await twilioClient.verify.v2
      .services(TWILIO_SERVICE_SID)
      .verifications.create({ to: phoneNumber, channel: "whatsapp" });

    res.json({
      message: "We have sent a verification code to the provide code",
      status: verification.status,
    });
  } catch (error) {
    console.log(error);
    res.json({ error });
  }
});

app.post("/check/:phoneNumber/:code", async (req, res) => {
  try {
    const { phoneNumber, code } = req.params;
    const verification = await twilioClient.verify.v2
      .services(TWILIO_SERVICE_SID)
      .verificationChecks.create({ to: phoneNumber, code });

    if (verification.status === "approved") {
      res.json({
        message: "Verication has been successfully",
        status: verification.status,
      });
    } else {
      throw new Error("Provided code or phone number are not correct.");
    }
  } catch (error) {
    console.log(error);
    res.json({ error: error.message });
  }
});

app.post("/message/:phoneNumber", async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    const { message: whatsappMessage } = req.body;

    const message = await twilioClient.messages.create({
      from: `whatsapp:${TWILIO_SANDBOX_PHONE}`,
      body: whatsappMessage,
      to: `whatsapp:${phoneNumber}`,
    });
    res.json({ message: message.sid });
  } catch (error) {
    console.log(error);
    res.json({ error: error.message });
  }
});

app.listen(process.env.PORT, () =>
  console.log(`Listening on port http://localhost:${PORT}`)
);
