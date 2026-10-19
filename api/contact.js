// Vercel Serverless Function & Local Dev Handler for /api/contact
module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    }
    body = body || {};

    const { fromEmail, message } = body;

    // Validate inputs
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!fromEmail || typeof fromEmail !== 'string' || !emailRegex.test(fromEmail.trim())) {
      return res.status(400).json({
        ok: false,
        error: 'Invalid email address'
      });
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        ok: false,
        error: 'Message cannot be empty'
      });
    }

    const cleanEmail = fromEmail.trim();
    const cleanMessage = message.trim();
    const recipientEmail = process.env.CONTACT_EMAIL || 'helpyoukorean@gmail.com';
    const resendApiKey = process.env.RESEND_API_KEY;
    const verifiedSender = process.env.RESEND_FROM_EMAIL || 'Manyeo Studio <onboarding@resend.dev>';

    const emailSubject = 'New Contact Inquiry';
    const emailText = `Email: ${cleanEmail}\n\nMessage:\n${cleanMessage}`;

    // If Resend API Key is configured, send real email via Resend
    if (resendApiKey) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: verifiedSender,
          to: [recipientEmail],
          reply_to: cleanEmail,
          subject: emailSubject,
          text: emailText
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.error('[Resend Error]', data);
        return res.status(response.status || 500).json({
          ok: false,
          error: data.message || 'Failed to send email through provider'
        });
      }

      console.log(`[Contact Inquiry Sent] To: ${recipientEmail} | Reply-To: ${cleanEmail} | ID: ${data.id}`);
      return res.status(200).json({
        ok: true,
        message: "Message sent. We'll get back to you soon.",
        id: data.id
      });
    }

    // Dev fallback: when RESEND_API_KEY is not yet set in environment
    console.log(`\n======================================================`);
    console.log(`  [CONTACT INQUIRY RECEIVED] (Dev Mode / No RESEND_API_KEY)`);
    console.log(`  To: ${recipientEmail}`);
    console.log(`  Reply-To: ${cleanEmail}`);
    console.log(`  Subject: ${emailSubject}`);
    console.log(`  Message:\n  ${cleanMessage.replace(/\n/g, '\n  ')}`);
    console.log(`======================================================\n`);

    return res.status(200).json({
      ok: true,
      message: "Message sent. We'll get back to you soon.",
      devMode: true
    });
  } catch (error) {
    console.error('[Contact Error]', error);
    return res.status(500).json({
      ok: false,
      error: error.message || 'Internal server error'
    });
  }
};
