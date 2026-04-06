const sgMail = require("@sendgrid/mail");

const ownerTemplate = ({ name, email, purpose, description }) => `
  <div style="font-family: Arial, sans-serif; padding: 20px; background:#f5f7fb;">
    <div style="max-width:600px;margin:auto;background:white;padding:20px;border-radius:12px;">
      <h2 style="color:#6a11cb;text-align:center;">New Contact Request</h2>
      <hr/>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Purpose:</strong> <span style="color:#6a11cb;font-weight:bold;">${purpose}</span></p>
      <div style="margin-top:10px;padding:10px;background:#f9f9f9;border-radius:8px;">
        <strong>Description:</strong>
        <p>${description}</p>
      </div>
      <p style="margin-top:20px;font-size:14px;color:#777;">Please respond to this user as soon as possible.</p>
    </div>
  </div>
`;

const userTemplate = ({ name, purpose }) => `
  <div style="font-family: Arial, sans-serif; padding: 20px; background:#f5f7fb;">
    <div style="max-width:600px;margin:auto;background:white;padding:20px;border-radius:12px;text-align:center;">
      <h2 style="color:#6a11cb;">Thank You, ${name}!</h2>
      <p style="font-size:16px;">We've received your request regarding:</p>
      <p style="font-size:18px;font-weight:bold;color:#6a11cb;">${purpose}</p>
      <div style="margin:20px 0;padding:15px;background:#f9f9f9;border-radius:8px;">Our team will get back to you shortly.</div>
      <p style="font-size:14px;color:#777;">Thank you for reaching out to us.</p>
      <hr/>
      <p style="font-size:14px;">Regards,<br/><strong>Contact App</strong></p>
    </div>
  </div>
`;

module.exports = async (req, res) => {
  console.log("=== REQUEST RECEIVED ===");
  console.log("Method:", req.method);
  console.log("SENDGRID_API_KEY set:", !!process.env.SENDGRID_API_KEY);
  console.log("SENDGRID_API_KEY value:", process.env.SENDGRID_API_KEY ? process.env.SENDGRID_API_KEY.substring(0, 10) + "..." : "NOT SET");
  console.log("OWNER_EMAIL:", process.env.OWNER_EMAIL);
  console.log("FROM_EMAIL:", process.env.FROM_EMAIL);

  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { name, email, purpose, description } = req.body;
  console.log("Body:", req.body);

  if (!name || !email || !purpose || !description) {
    return res.status(400).json({ success: false, error: "All fields are required" });
  }

  if (!process.env.SENDGRID_API_KEY) {
    console.error("ERROR: SENDGRID_API_KEY is not set in environment");
    return res.status(500).json({ success: false, error: "Email service not configured" });
  }

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const FROM_EMAIL = process.env.FROM_EMAIL || "contact@app-to-contact.com";
  const OWNER_EMAIL = process.env.OWNER_EMAIL || FROM_EMAIL;

  try {
    console.log("Sending email to owner:", OWNER_EMAIL);
    await sgMail.send({
      to: OWNER_EMAIL,
      from: FROM_EMAIL,
      subject: `New Contact: ${purpose}`,
      html: ownerTemplate({ name, email, purpose, description }),
    });

    console.log("Sending confirmation email to user:", email);
    await sgMail.send({
      to: email,
      from: FROM_EMAIL,
      subject: "Thank You for Contacting Us",
      html: userTemplate({ name, purpose }),
    });

    console.log("=== SUCCESS ===");
    return res.status(200).json({ success: true, message: "Message sent successfully" });
  } catch (error) {
    console.error("=== SENDGRID ERROR ===");
    console.error("Error message:", error.message);
    console.error("Error response:", JSON.stringify(error?.response?.body, null, 2));
    console.error("Full error:", error);
    return res.status(500).json({ success: false, error: "Failed to send message" });
  }
};
