# client-reporting-portal
Google Apps Script, Google Docs API, Looker Studio

## 💼 Client Reporting Portal (Project Overview)
### 🔧 Tech Stack
- Google Sheets: Data backend (client KPIs, metrics)
- Apps Script: Automate report generation, email delivery
- Google Docs API: Create polished PDF reports from templates
- Looker Studio: Visual dashboards (interactive, shareable)

### 📐 Core Features
1. Client Data Input
    - One master Google Sheet to hold data per client (or tab per client, or one row per entry)
    - Optional: Google Form for internal team to submit new updates

2. Automated Report Generation
    - Template in Google Docs with placeholders (e.g., {{client_name}}, {{total_sales}}, {{top_channel}})
    - Apps Script pulls from Sheets and injects into template
    - Exports as PDF

3. Email Delivery
    - Script automatically emails client the PDF on a set schedule
    - Dynamic To/Subject/Body with personalized message

4. Looker Studio Dashboard
    - Live dashboard pulling from the same Sheet
    - Option to embed a filtered view per client
    - Add charts for performance over time, channel breakdowns, etc.

### 🗂️ Folder Structure
/ClientReports/
  - /Templates/Client_Report_Template
  - /Reports/Client_Name/YYYY-MM/Report.pdf
  - /Data/Client_Data_Sheet
  - /Scripts/AppsScript.gs
