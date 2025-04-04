# 📊 Client Reporting Automation Portal

A fully-automated reporting engine built with Google Apps Script, Google Sheets, Google Docs, and Looker Studio — complete with email delivery, PDF generation, and a client-facing web app portal.

![Banner](https://via.placeholder.com/1200x400?text=Client+Reporting+Portal)

## ✨ Features

✅ Automated report generation (Google Docs → PDF)  
✅ Email delivery to one or multiple recipients  
✅ Dynamic charts, bullet points, and branding  
✅ Looker Studio dashboard integration  
✅ Organized Drive folders per client  
✅ Logging of every report generated  
✅ Google Apps Script web app for clients to view/download reports  

---

## 🔧 Tech Stack

- **Google Apps Script**
- **Google Sheets** (data source + log)
- **Google Docs** (template engine)
- **Google Drive** (PDF storage)
- **Looker Studio** (interactive dashboards)
- **HTML/CSS frontend** (via GAS Web App)

---

## 🖥️ How It Works

1. 📥 **Client data** is stored in a [Google Sheet (`Client_Data`)](https://docs.google.com/spreadsheets/d/15jq8m6QBpQb1hOMVxTeJoxTVrbZQ-J8dcZPy6jooc6A/edit?usp=drive_link)
2. 📄 [A **report template** in Google Docs](https://docs.google.com/document/d/1Mw3ulFIMcFM4T7bfEDgHvg8yz1yHzLEvQgDXcuyg72Y/edit?usp=drive_link) is populated dynamically
3. 💾 The finished report is **saved as a PDF** to Drive
4. 💌 The PDF is **emailed to one or more recipients**
5. 📋 A record of the report is **logged in `Report_Logs`**
6. 🌐 A **secure web app** allows clients to view/download past reports and access their live Looker Studio dashboards

---

## 📷 Screenshots

| Auto-Generated PDF | Client Web Portal |
|--------------------|-------------------|
| ![PDF Sample](https://via.placeholder.com/400x250?text=Report+PDF) | ![Web App](https://via.placeholder.com/400x250?text=Client+Portal) |

---

## 🧠 Key Highlights

- Uses **Google Workspace tools only** — no third-party dependencies
- Client dashboards are **interactive, live-filtered Looker Studio reports**
- Web App supports **multi-client access** via email filtering
- Fully customizable and scalable

---

## 🧪 Dev Notes

- Web App uses `google.script.run` to fetch reports from `Report_Logs`
- Email field matching is case-insensitive
- Google Docs template uses `{{placeholders}}` replaced via `.replaceText()`
- Drive folders are auto-created per client

---

## 🏁 Why I Built This

As part of my portfolio, I wanted to showcase my expertise in:
- Google Apps Script
- Workflow automation
- Document generation and delivery
- Web app UX using built-in Google tools
- Real-world client-facing product logic

---

## 🔮 Future Features

- Admin dashboard for batch re-runs or report regeneration  
- Slack or email digests for internal teams  
- Looker Studio usage tracking per client  
- User authentication with Google Sign-In scopes  

---

## 📌 Live Demo / Video Walkthrough

> Coming soon — or contact me for a private walkthrough.

---

## 🚀 Try It or Hire Me

Want this for your agency or internal reporting workflow?  
I'm available for freelance + contract work — [Let’s talk](mailto:gilbertfieldpalmer@gmail.com)

---

