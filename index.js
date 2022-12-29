import express from "express";
import * as dotenv from "dotenv";

dotenv.config();

const { PORT, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_SERVICE_SID } =
  process.env;

const app = express();

import twilio from "twilio";
const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.post("/verify/:phoneNumber", async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    const { status } = await twilioClient.verify.v2
      .services(TWILIO_SERVICE_SID)
      .verifications.create({
        to: phoneNumber,
        channel: "whatsapp",
      });

    res.json({ status });
  } catch (error) {
    console.log(error);
  }
});

app.post("/check/:phoneNumber/:code", async (req, res) => {
	try {
		const { phoneNumber, code } = req.params;
		const { status } = await twilioClient.verify.v2.services(TWILIO_SERVICE_SID).verificationChecks.create({
			to: phoneNumber,
			code
		})

		if (status === "approved") {
			res.json({ status })
		} else {
			res.status(401).json({ status: "Invalid"})
		}
	} catch (error) {
		console.log(error)
	}
})

app.listen(PORT);
