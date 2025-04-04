function getOrCreateChartSheet() {
     const ss = SpreadsheetApp.getActiveSpreadsheet();
     let chartSheet = ss.getSheetByName('ChartHelper');
     if (!chartSheet) {
          chartSheet = ss.insertSheet('ChartHelper');
          chartSheet.hideSheet(); // Hide it from view
     }
     chartSheet.clear();
     return chartSheet;
}

function doGet() {
     return HtmlService.createHtmlOutputFromFile('Home');
}

function getClientReports(userEmail) {
     Logger.log('📥 Incoming email: ' + userEmail);

     if (!userEmail) return { userEmail: 'none', reports: [] };

     const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Report_Logs');
     const data = sheet.getDataRange().getValues();
     const headers = data[0];

     Logger.log('Headers: ' + headers);

     const headerMap = {};
     headers.forEach((h, i) => {
          const key = h.toString().trim().toLowerCase().replace(/\s+/g, ' ');
          headerMap[key] = i;
     });

     Logger.log('Header map: ' + JSON.stringify(headerMap));

     const reports = [];

     for (let i = 1; i < data.length; i++) {
          const row = data[i];
          const recipients = row[headerMap['recipients']];

          Logger.log(`Row ${i} | recipients: ${recipients}`);

          if (recipients && recipients.toString().toLowerCase().includes(userEmail.toLowerCase())) {
               reports.push({
                    client: row[headerMap['client name']],
                    period: new Date(row[headerMap['reporting period']]).toLocaleDateString('en-US', {
                         month: 'short',
                         year: 'numeric'
                    }),
                    pdf: row[headerMap['pdf link']],
                    dashboard: row[headerMap['dashboard link']]
               });
          }
     }

     Logger.log('✅ Matched reports: ' + JSON.stringify(reports));

     return {
          userEmail,
          reports
     };
}

function logReportDelivery(clientName, reportingPeriod, pdfUrl, dashboardUrl, recipients) {
     const logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Report_Logs');
     if (!logSheet) {
          throw new Error('Report_Logs sheet not found. Please create one with headers.');
     }

     const timestamp = new Date();
     logSheet.appendRow([timestamp, clientName, reportingPeriod, pdfUrl, dashboardUrl, recipients]);
}

function onOpen() {
     const ui = SpreadsheetApp.getUi();
     ui.createMenu('📈 Client Reports')
          .addItem('Generate Report for Selected Client', 'showClientReportPrompt')
          .addItem('Generate Reports for All Clients (This Month)', 'generateReportsForAllClients')
          .addToUi();
}

function generateReportsForAllClients() {
     const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Client_Data');
     const data = sheet.getDataRange().getValues();
     const headers = data[0];
     const today = new Date();
     const month = today.toLocaleString('en-US', { month: 'short' });
     const year = today.getFullYear();
     const reportingPeriod = `${month} ${year}`;

     const clientEmailMap = {};

     for (let i = 1; i < data.length; i++) {
          const client = data[i][headers.indexOf('client_name')];
          const periodRaw = data[i][headers.indexOf('reporting_period')];

          let periodFormatted = '';
          if (periodRaw instanceof Date) {
               periodFormatted = Utilities.formatDate(periodRaw, Session.getScriptTimeZone(), 'MMM yyyy');
          } else {
               periodFormatted = String(periodRaw).trim();
          }

          if (periodFormatted === reportingPeriod) {
               if (!clientEmailMap[client]) {
                    clientEmailMap[client] = [];
               }

               const emailColIndex = headers.indexOf('email_contact');
               if (emailColIndex !== -1) {
                    const email = data[i][emailColIndex];
                    if (email) {
                         clientEmailMap[client].push(email.trim());
                    }
               }
          }
     }

     for (const [client, emails] of Object.entries(clientEmailMap)) {
          const uniqueEmails = [...new Set(emails)];
          const recipientList = uniqueEmails.join(',');
          generateClientReport(client, reportingPeriod, recipientList);
     }

     SpreadsheetApp.getUi().alert(`Batch reports generated for ${Object.keys(clientEmailMap).length} clients.`);
}

function showClientReportPrompt() {
     const ui = SpreadsheetApp.getUi();

     const clientResponse = ui.prompt('Enter client name (exactly as in sheet):');
     if (clientResponse.getSelectedButton() !== ui.Button.OK) return;

     const periodResponse = ui.prompt('Enter reporting period (e.g., Mar 2025):');
     if (periodResponse.getSelectedButton() !== ui.Button.OK) return;

     const emailResponse = ui.prompt(
          'Enter recipient email address(es)',
          'Separate multiple addresses with commas',
          ui.ButtonSet.OK_CANCEL
     );
     if (emailResponse.getSelectedButton() !== ui.Button.OK) return;

     const client = clientResponse.getResponseText();
     const period = periodResponse.getResponseText();
     const email = emailResponse.getResponseText();

     generateClientReport(client, period, email);
}

function getOrCreateClientFolder(baseFolderId, clientName) {
     const baseFolder = DriveApp.getFolderById(baseFolderId);
     const folders = baseFolder.getFoldersByName(clientName);

     if (folders.hasNext()) {
          return folders.next();
     } else {
          return baseFolder.createFolder(clientName);
     }
}

function generateClientReport(clientName, reportingPeriod, recipientEmail) {
     const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Client_Data');
     const data = sheet.getDataRange().getValues();
     const headers = data[0];

     Logger.log('headers: ' + headers);
     Logger.log('input Client Name: ' + clientName);
     Logger.log('input Reporting Period: ' + reportingPeriod);

     let record = null;

     for (let i = 1; i < data.length; i++) {
          const row = data[i];
          const rowClient = String(row[headers.indexOf('client_name')]).trim().toLowerCase();

          const rowPeriodRaw = row[headers.indexOf('reporting_period')];
          let rowPeriod;
          if (rowPeriodRaw instanceof Date) {
               rowPeriod = Utilities.formatDate(rowPeriodRaw, Session.getScriptTimeZone(), 'MMM yyyy').toLowerCase();
          } else {
               rowPeriod = String(rowPeriodRaw).trim().toLowerCase();
          }

          Logger.log(`Checking row ${i}: client = ${rowClient}, period = ${rowPeriod}`);

          if (rowClient === clientName.trim().toLowerCase() && rowPeriod === reportingPeriod.trim().toLowerCase()) {
               // Convert matching row into an object
               record = headers.reduce((obj, header, j) => {
                    obj[header] = row[j];
                    return obj;
               }, {});

               if (record['reporting_period'] instanceof Date) {
                    record['reporting_period'] = Utilities.formatDate(
                         record['reporting_period'],
                         Session.getScriptTimeZone(),
                         'MMM yyyy'
                    );
               }

               // Format total_revenue as USD
               if (!isNaN(record['total_revenue'])) {
                    record['total_revenue'] = new Intl.NumberFormat('en-US', {
                         style: 'currency',
                         currency: 'USD'
                    }).format(record['total_revenue']);
               }

               // Format conversion_rate as percentage
               if (!isNaN(record['conversion_rate'])) {
                    const rate = parseFloat(record['conversion_rate']);
                    record['conversion_rate'] = (rate * 100).toFixed(1) + '%';
               }

               break;
          }
     }

     if (!record) {
          Logger.log('No matching client data found.');
          return;
     }

     const docTemplate = DriveApp.getFilesByName('Client_Report_Template').next();
     const copy = docTemplate.makeCopy(`Report - ${record.client_name} - ${record.reporting_period}`);
     const doc = DocumentApp.openById(copy.getId());
     const body = doc.getBody();

     body.clear();
     body.appendParagraph('📄 Monthly Performance Report')
          .setHeading(DocumentApp.ParagraphHeading.HEADING2)
          .setAlignment(DocumentApp.HorizontalAlignment.CENTER);

     body.appendParagraph(`${record.client_name} — ${record.reporting_period}`)
          .setHeading(DocumentApp.ParagraphHeading.HEADING3)
          .setAlignment(DocumentApp.HorizontalAlignment.CENTER);

     body.appendParagraph(`Generated on: ${new Date().toDateString()}`)
          .setFontSize(10)
          .setForegroundColor('#888888')
          .setAlignment(DocumentApp.HorizontalAlignment.CENTER);

     body.appendHorizontalRule();

     const revenue = parseFloat(record.total_revenue.replace(/[^0-9.-]+/g, ''));
     const conversions = parseFloat(record.total_conversions);

     const chartSheet = getOrCreateChartSheet();
     chartSheet.getRange('A1').setValue('Metric');
     chartSheet.getRange('B1').setValue('Value');
     chartSheet.getRange('A2').setValue('Revenue');
     chartSheet.getRange('B2').setValue(revenue);
     chartSheet.getRange('A3').setValue('Conversions');
     chartSheet.getRange('B3').setValue(conversions);

     const chart = chartSheet
          .newChart()
          .setChartType(Charts.ChartType.BAR)
          .addRange(chartSheet.getRange('A1:B3'))
          .setPosition(5, 1, 0, 0)
          .setOption('title', 'Performance Overview')
          .build();
     chartSheet.insertChart(chart);

     const sheetCharts = chartSheet.getCharts();
     const chartImageBlob = sheetCharts[0].getAs('image/png');

     body.appendImage(chartImageBlob);

     body.appendParagraph('Key Metrics').setHeading(DocumentApp.ParagraphHeading.HEADING4);

     const metrics = [
          `💰 Total Revenue: ${record.total_revenue}`,
          `👥 Total Conversions: ${record.total_conversions}`,
          `📈 Top Channel: ${record.top_channel}`,
          `🎯 Conversion Rate: ${record.conversion_rate}`
     ];

     metrics.forEach((metric) => {
          body.appendListItem(metric).setGlyphType(DocumentApp.GlyphType.BULLET);
     });

     body.appendParagraph('Campaign Summary').setHeading(DocumentApp.ParagraphHeading.HEADING4);
     body.appendParagraph(record.campaign_summary);

     body.appendParagraph('Key Insights').setHeading(DocumentApp.ParagraphHeading.HEADING4);
     body.appendParagraph(record.key_insights);

     body.appendParagraph('Recommendations').setHeading(DocumentApp.ParagraphHeading.HEADING4);
     body.appendParagraph(record.recommendations);

     function toLabel(key) {
          return key.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
     }

     doc.saveAndClose();

     const pdf = DriveApp.getFileById(copy.getId()).getAs('application/pdf');
     const baseFolderId = '1g0Be2dlLvE_l0uMmae10olKwsjB6pshx'; // ID of top-level "Client Reports" folder
     const folder = getOrCreateClientFolder(baseFolderId, record.client_name);

     const saved = folder.createFile(pdf).setName(`Report - ${record.client_name} - ${record.reporting_period}.pdf`);

     Logger.log(`Report created: ${saved.getUrl()}`);

     const dashboardBaseUrl = 'https://lookerstudio.google.com/reporting/9782f9d9-64a6-4488-b9db-bbfce6586947';
     const dashboardLink = `${dashboardBaseUrl}&params={"client_name":"${encodeURIComponent(record.client_name)}"}`;

     const emailSubject = `📊 ${record.client_name} - ${record.reporting_period} Report`;

     const htmlBody = `
      <p>Hi ${record.client_name},</p>
      <p>Your performance report for <strong>${record.reporting_period}</strong> is attached as a PDF.</p>
      <p><a href="${dashboardLink}" target="_blank">📊 View your live dashboard</a></p>
      <p>Best regards,<br>Client Reports Bot</p>
    `;

     GmailApp.sendEmail(recipientEmail, emailSubject, htmlBody, {
          attachments: [pdf],
          name: 'Client Reports Bot',
          htmlBody: htmlBody
     });

     Logger.log(`Email sent to: ${recipientEmail}`);

     logReportDelivery(record.client_name, record.reporting_period, saved.getUrl(), dashboardLink, recipientEmail);
}
