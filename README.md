# Contact Us Application - Gmail API Implementation

A full-stack contact form application using **Gmail API** instead of SMTP to send emails. This solution works reliably on all cloud platforms (Render, Heroku, Vercel, Railway, etc.) without port blocking issues.

---

## Table of Contents

1. [Why Gmail API Instead of SMTP?](#why-gmail-api-instead-of-smtp)
2. [Project Structure](#project-structure)
3. [Environment Variables](#environment-variables)
4. [Complete Frontend Code](#complete-frontend-code)
5. [Complete Backend Code](#complete-backend-code)
6. [Google Cloud Setup Guide](#google-cloud-setup-guide)
7. [Installation & Running](#installation--running)
8. [Deployment](#deployment)

---

## Why Gmail API Instead of SMTP?

| Issue | SMTP | Gmail API |
|-------|------|-----------|
| Port 465/587 | Blocked on cloud platforms | Uses HTTPS (port 443) |
| IP Reputation | Data center IPs flagged | Google trusts its own API |
| Spam Folders | High risk | Delivers to inbox |
| Setup | Complex with app passwords | OAuth2 with refresh tokens |

---

## Project Structure

```
contact-us/
├── .env                    # Environment variables (NOT committed to git)
├── .gitignore              # Git ignore file
├── package.json            # Root package
├── server/
│   ├── index.js            # Backend server
│   └── package.json        # Server dependencies
└── client/
    ├── index.html          # HTML entry point
    ├── main.jsx            # React entry point
    ├── App.jsx             # Main React component
    ├── style.css           # Styles
    └── package.json        # Frontend dependencies
```

---

## Environment Variables

Create a `.env` file in the project root with these values:

```env
GMAIL_CLIENT_ID=your_client_id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your_client_secret
GMAIL_REFRESH_TOKEN=your_refresh_token
GMAIL_EMAIL=your-email@gmail.com
```

> **IMPORTANT**: Never commit `.env` to version control. It's already in `.gitignore`.

---

## Complete Frontend Code

### `client/package.json`

```json
{
  "name": "frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "start": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hot-toast": "^2.6.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.0"
  }
}
```

### `client/index.html`

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Contact App</title>
    <link rel="icon" href="data:,">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/main.jsx"></script>
    <script type="text/javascript">
    (function (l) {
      if (l.search[1] === "/") {
        var decoded = l.search
          .slice(1)
          .split("&")
          .map(function (s) {
            return s.replace(/~and~/g, "&");
          })
          .join("?");
        window.history.replaceState(
          null,
          null,
          l.pathname.slice(0, -1) + decoded + l.hash
        );
      }
    })(window.location);
    </script>
  </body>
</html>
```

### `client/main.jsx`

```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./style.css";
import { Toaster } from "react-hot-toast";

ReactDOM.createRoot(document.getElementById("root")).render(
  <>
    <Toaster position="top-right" />
    <App />
  </>
);
```

### `client/App.jsx`

```jsx
import React, { useState } from "react";
import toast from "react-hot-toast";

const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000/api/contact"
    : "https://your-backend-url.vercel.app/api/contact";

function App() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    purpose: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Message sent successfully 🚀");
        setForm({
          name: "",
          email: "",
          purpose: "",
          description: "",
        });
      } else {
        toast.error(data.error || "Something went wrong");
      }
    } catch (error) {
      toast.error("Server error");
    }

    setLoading(false);
  };

  return (
    <div className="wrapper">
      <div className="card">
        <h2>Contact Us</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <select
            name="purpose"
            value={form.purpose}
            onChange={handleChange}
            required
          >
            <option value="">Select Purpose</option>
            <option value="General Inquiry">General Inquiry</option>
            <option value="Support">Support</option>
            <option value="Business">Business</option>
            <option value="Other">Other</option>
          </select>
          <textarea
            name="description"
            placeholder="Your Message"
            value={form.description}
            onChange={handleChange}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
```

### `client/style.css`

```css
body {
  margin: 0;
  font-family: "Poppins", sans-serif;
}

.wrapper {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.card {
  backdrop-filter: blur(15px);
  background: rgba(255, 255, 255, 0.1);
  padding: 30px;
  border-radius: 20px;
  width: 350px;
  color: white;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  animation: fadeIn 0.8s ease;
}

.card h2 {
  text-align: center;
  margin-bottom: 20px;
}

input, textarea, select {
  width: 100%;
  padding: 12px;
  margin: 8px 0;
  border-radius: 10px;
  border: none;
  outline: none;
  background: rgba(255,255,255,0.2);
  color: white;
  box-sizing: border-box;
}

select option {
  color: black;
}

input::placeholder,
textarea::placeholder {
  color: #eee;
}

button {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 10px;
  background: white;
  color: #6a11cb;
  font-weight: bold;
  cursor: pointer;
  transition: 0.3s;
}

button:hover {
  background: #f1f1f1;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

## Complete Backend Code

### `server/package.json`

```json
{
  "name": "backend",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "express": "^4.18.2",
    "googleapis": "^171.4.0",
    "nodemailer": "^6.10.1"
  }
}
```

### `server/index.js`

```javascript
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
      <p style="font-size:16px;">We've received your request regarding:</p>
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
```

---

## Google Cloud Setup Guide

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **New Project** → Name it "Email Service"
3. Note your **Project ID**

### Step 2: Enable Gmail API

1. Go to **APIs & Services > Library**
2. Search "Gmail API"
3. Click **Enable**

### Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services > OAuth consent screen**
2. Select **External** → Click **Create**
3. Fill in:
   - App name: `Contact App`
   - User support email: `your-email@gmail.com`
   - Developer contact: `your-email@gmail.com`
4. Click **Save and Continue** (scopes page)
5. On **Test Users** → Click **Add Users**
6. Add your Gmail address
7. Click **Save and Continue**

### Step 4: Create OAuth Credentials

1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Choose **Web application**
4. Under **Authorized redirect URIs**, add:
   ```
   https://developers.google.com/oauthplayground
   ```
5. Click **Create**
6. Copy **Client ID** and **Client Secret**

### Step 5: Generate Refresh Token

1. Go to [OAuth 2.0 Playground](https://developers.google.com/oauthplayground)
2. Click gear icon → Check "Use your own OAuth credentials"
3. Enter your Client ID and Client Secret
4. In left sidebar → **Gmail API v1** → Select scope: `https://mail.google.com/`
5. Click **Authorize APIs**
6. Sign in with your Gmail account
7. Click **Advanced** → **Go to [App Name] (unsafe)** → **Allow**
8. Click **Exchange authorization code for tokens**
9. Copy the **Refresh Token**

---

## Installation & Running

### 1. Install Dependencies

```bash
# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../server
npm install
```

### 2. Configure Environment

Create `.env` file in project root:

```env
GMAIL_CLIENT_ID=your_client_id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your_client_secret
GMAIL_REFRESH_TOKEN=your_refresh_token
GMAIL_EMAIL=your-email@gmail.com
```

### 3. Run Backend

```bash
cd server
node index.js
```

Server runs on: `http://localhost:5000`

### 4. Run Frontend

```bash
cd client
npm run dev
```

Frontend runs on: `http://localhost:5173`

### 5. Test

1. Open `http://localhost:5173`
2. Fill the contact form
3. Submit - you should receive:
   - Email to owner (you) with contact details
   - Thank you email to user

---

## Deployment

### Deploy Backend to Render

1. Create [Render](https://render.com) account
2. Click **New** → **Web Service**
3. Connect your GitHub repo
4. Settings:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js`
5. Add Environment Variables from `.env`:
   - `GMAIL_CLIENT_ID`
   - `GMAIL_CLIENT_SECRET`
   - `GMAIL_REFRESH_TOKEN`
   - `GMAIL_EMAIL`
6. Click **Deploy**

### Deploy Frontend to Vercel

1. Update `client/App.jsx` API_URL to your Render URL:
   ```jsx
   const API_URL = "https://your-render-app.onrender.com/api/contact";
   ```

2. Create [Vercel](https://vercel.com) account
3. Import your GitHub repo
4. Set root directory to `client`
5. Deploy

---

## Troubleshooting

### Error: "invalid_grant"

- Refresh token expired or revoked
- Solution: Generate new refresh token from OAuth Playground

### Error: "Insufficient permission"

- Wrong OAuth scope selected
- Solution: Use `https://mail.google.com/` scope

### Error: "App hasn't completed verification"

- Test user not added
- Solution: Add your email in OAuth consent screen Test Users

### Emails going to spam

- Use an established Gmail account
- New accounts have low reputation

---

## Gmail Limits

- **Free Gmail:** ~500 emails/day
- **Google Workspace:** ~2000 emails/day
- **Rate Limit:** 100 requests/second

---

## License

MIT License
