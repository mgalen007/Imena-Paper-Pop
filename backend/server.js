const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Generate PDF endpoint
app.post('/api/generate-pdf', async (req, res) => {
  try {
    const { eventTitle, eventDate, eventTime, location, agenda, organizer, description } = req.body;

    // Validate required fields
    if (!eventTitle || !eventDate || !eventTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }


    // Read logo and convert to base64
    const logoPath = path.join(__dirname, 'imena-logo.png');
    let logoBase64 = '';
    if (fs.existsSync(logoPath)) {
      const logoBuffer = fs.readFileSync(logoPath);
      logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
    }

    // Launch browser
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
      executablePath: '/usr/bin/google-chrome'
    });

    const page = await browser.newPage();

    // Create HTML content for the invitation (Minimalistic & Clean Design)
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@700;800;900&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #1A74ED;
      --text: #1E293B;
      --text-light: #64748B;
      --bg: #F8FAFC;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', sans-serif;
      background: white;
      color: var(--text);
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 0;
    }
    
    .invitation-card {
      width: 100%;
      height: 100%;
      max-width: 800px;
      background: white;
      display: flex;
      flex-direction: column;
    }
    
    .header {
      background-color: var(--primary);
      padding: 60px 40px;
      text-align: center;
      color: white;
    }
    
    .logo {
      width: 80px;
      height: 80px;
      background: white;
      border-radius: 50%;
      margin: 0 auto 20px;
      padding: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .logo img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    
    .header h1 {
      font-family: 'Outfit', sans-serif;
      font-size: 32px;
      font-weight: 900;
      margin-bottom: 8px;
      letter-spacing: -0.02em;
    }
    
    .header p {
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      font-weight: 700;
      opacity: 0.9;
    }
    
    .content {
      padding: 60px 60px;
      flex: 1;
    }
    
    .event-title {
      font-family: 'Outfit', sans-serif;
      font-size: 42px;
      font-weight: 900;
      color: var(--primary);
      margin-bottom: 24px;
      line-height: 1.1;
    }
    
    .description {
      font-size: 18px;
      color: var(--text-light);
      line-height: 1.6;
      margin-bottom: 40px;
      border-bottom: 1px solid #E2E8F0;
      padding-bottom: 40px;
    }
    
    .details-row {
      display: flex;
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .detail-item {
      flex: 1;
      background: var(--bg);
      padding: 20px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      gap: 15px;
      border: 1px solid #E2E8F0;
    }

    .detail-icon {
      width: 48px;
      height: 48px;
      background: white;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    
    .detail-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--text-light);
      font-weight: 800;
      margin-bottom: 4px;
    }
    
    .detail-value {
      font-size: 16px;
      font-weight: 700;
      color: var(--text);
    }
    
    .agenda-box {
      background: var(--bg);
      padding: 30px;
      border-radius: 16px;
      margin-top: 20px;
    }
    
    .agenda-title {
      font-size: 14px;
      font-weight: 900;
      color: var(--primary);
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .agenda-content {
      font-size: 15px;
      color: var(--text);
      line-height: 1.8;
      white-space: pre-line;
    }
    
    .footer {
      padding: 40px 60px;
      border-top: 1px solid #E2E8F0;
      text-align: center;
    }
    
    .footer-label {
      font-size: 12px;
      color: var(--text-light);
      margin-bottom: 4px;
    }
    
    .organizer-name {
      font-family: 'Outfit', sans-serif;
      font-size: 20px;
      font-weight: 800;
      color: var(--text);
    }
    
    .tagline {
      font-size: 13px;
      color: var(--text-light);
      font-style: italic;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <div class="invitation-card">
    <div class="header">
      <div class="logo">
        <img src="${logoBase64}" alt="Imena Logo">
      </div>
      <h1>Imena Family</h1>
      <p>Official Invitation</p>
    </div>
    
    <div class="content">
      <h2 class="event-title">${eventTitle}</h2>
      
      ${description ? `<p class="description">${description}</p>` : ''}
      
      <div class="details-row">
        <div class="detail-item">
          <div class="detail-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1A74ED" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>
          <div>
            <div class="detail-label">Date</div>
            <div class="detail-value">${new Date(eventDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
        </div>
        
        <div class="detail-item">
          <div class="detail-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1A74ED" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div>
            <div class="detail-label">Time</div>
            <div class="detail-value">${eventTime}</div>
          </div>
        </div>
      </div>
      
      ${location ? `
      <div class="detail-item" style="margin-bottom: 40px;">
        <div class="detail-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1A74ED" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
        <div>
          <div class="detail-label">Location</div>
          <div class="detail-value">${location}</div>
        </div>
      </div>
      ` : ''}
      
      ${agenda ? `
      <div class="agenda-box">
        <div class="agenda-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A74ED" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>
          EVENT AGENDA
        </div>
        <div class="agenda-content">${agenda}</div>
      </div>
      ` : ''}
    </div>
    
    <div class="footer">
      <div class="footer-label">Organized By</div>
      <div class="organizer-name">${organizer || 'Imena Family'}</div>
      <div class="tagline">Ensemble, lumineux et courageux</div>
    </div>
  </div>
</body>
</html>
    `;

    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0px',
        right: '0px',
        bottom: '0px',
        left: '0px'
      }
    });

    await browser.close();

    // Send PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Imena-Invitation-${Date.now()}.pdf`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF', details: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Imena Paper Pop API is running' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎉 Imena Paper Pop server running on http://localhost:${PORT}`);
});
