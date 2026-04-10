const express = require("express");
const cors = require("cors");
const { google } = require("googleapis");
const MailComposer = require("nodemailer/lib/mail-composer");
require("dotenv").config({ path: "../.env" });

const app = express();

app.use(cors());
app.use(express.json());

const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN,
});

const gmail = google.gmail({ version: "v1", auth: oauth2Client });

const ownerTemplate = ({ name, email, purpose, description }) => `
  <div style="font-family: Arial, sans-serif; padding: 20px; background:#f5f7fb;">
    <div style="max-width:600px;margin:auto;background:white;padding:20px;border-radius:12px;">
      <h2 style="color:#6a11cb;text-align:center;">📩 New Contact Request</h2>
      <hr/>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Purpose:</strong> <span style="color:#6a11cb;font-weight:bold;"> ${purpose}</span></p>
      <div style="margin-top:10px;padding:10px;background:#f9f9f9;border-radius:8px;">
        <strong>Description:</strong>
        <p>${description}</p>
      </div>
      <p style="margin-top:20px;font-size:14px;color:#777;">🚀 Respond to this user as soon as possible.</p>
    </div>
  </div>
`;

const userTemplate = ({ name, purpose }) => `
  <div style="font-family: Arial, sans-serif; padding: 20px; background:#f5f7fb;">
    <div style="max-width:600px;margin:auto;background:white;padding:20px;border-radius:12px;text-align:center;">
      <h2 style="color:#6a11cb;">Thank You, ${name}! 🎉</h2>
      <p style="font-size:16px;">We’ve received your request regarding:</p>
      <p style="font-size:18px;font-weight:bold;color:#6a11cb;">${purpose}</p>
      <div style="margin:20px 0;padding:15px;background:#f9f9f9;border-radius:8px;">
        Our team will get back to you shortly.
      </div>
      <p style="font-size:14px;color:#777;">Thank you for reaching out to us 💙</p>
      <hr/>
      <p style="font-size:14px;">Regards,<br/><strong>Your Company</strong></p>
    </div>
  </div>
`;

async function sendEmail(to, subject, htmlContent) {
  const mailOptions = {
    from: `Contact App <${process.env.GMAIL_EMAIL}>`,
    to: to,
    subject: subject,
    html: htmlContent,
    textEncoding: "base64",
  };

  const mail = new MailComposer(mailOptions);
  const message = await mail.compile().build();
  const rawMessage = Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const result = await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: rawMessage,
    },
  });

  return result.data;
}

app.post("/api/contact", async (req, res) => {
  const { name, email, purpose, description } = req.body;

  if (!name || !email || !purpose || !description) {
    return res.status(400).json({
      success: false,
      error: "All fields are required",
    });
  }

  try {
    await sendEmail(
      process.env.GMAIL_EMAIL,
      `📩 New Contact: ${purpose}`,
      ownerTemplate({ name, email, purpose, description })
    );

    await sendEmail(
      email,
      "🎉 Thank You for Contacting Us",
      userTemplate({ name, purpose })
    );

    return res.status(200).json({
      success: true,
      message: "Message sent successfully 🚀",
    });
  } catch (error) {
    console.error("Email Error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to send message",
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
