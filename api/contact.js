const querystring = require('querystring');

/**
 * Vercel Serverless Function to handle contact form submissions.
 * Expects application/x-www-form-urlencoded payload from the jQuery form.
 * Responds with plain text "success" or "error" to match existing frontend logic.
 */
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Method Not Allowed');
    return;
  }

  try {
    // Collect raw body (form-encoded)
    let rawBody = '';
    await new Promise((resolve, reject) => {
      req.on('data', (chunk) => {
        rawBody += chunk;
        // Basic guard against overly large payloads
        if (rawBody.length > 1e6) {
          req.connection.destroy();
          reject(new Error('Payload too large'));
        }
      });
      req.on('end', resolve);
      req.on('error', reject);
    });

    const parsed = querystring.parse(rawBody || '');
    const name = String(parsed.name || '').trim();
    const email = String(parsed.email || '').trim();
    const subject = String(parsed.subject || 'Website contact').trim();
    const message = String(parsed.message || '').trim();

    if (!email || !message) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'text/plain');
      res.end('error');
      return;
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error('Missing RESEND_API_KEY environment variable');
      res.statusCode = 500;
      res.setHeader('Content-Type', 'text/plain');
      res.end('error');
      return;
    }

    // Send email via Resend REST API
    const apiResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Portfolio Contact <onboarding@resend.dev>',
        to: ['dexter.renick@gmail.com'],
        reply_to: email,
        subject: `[Portfolio] ${subject}${name ? ` — ${name}` : ''}`,
        text: `${message}\n\nFrom: ${name || 'Anonymous'} <${email}>`,
      }),
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text().catch(() => '');
      console.error('Resend API error:', apiResponse.status, errorText);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'text/plain');
      res.end('error');
      return;
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('success');
  } catch (err) {
    console.error('Contact API error:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain');
    res.end('error');
  }
};


