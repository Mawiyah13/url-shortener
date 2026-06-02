import Url from '../models/Url.js';
import Analytics from '../models/Analytics.js';
import mockDb from '../config/mockDb.js';
import parseUserAgent from '../utils/uaParser.js';

// Anonymize IP address for security and compliance (e.g., GDPR)
const anonymizeIp = (ip) => {
  if (!ip) return 'Anonymous';
  if (ip === '::1' || ip === '127.0.0.1') return 'Localhost';
  
  // Clean IPv6 prefixed IPv4 addresses
  let cleanIp = ip.replace(/^.*:/, '');
  
  // Anonymize last octet/block
  const parts = cleanIp.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
  }
  
  return 'Anonymous';
};

// Clean Referrer header to pull domain source
const parseReferrer = (refHeader) => {
  if (!refHeader) return 'Direct';
  try {
    const url = new URL(refHeader);
    let host = url.hostname.replace('www.', '');
    
    // Map popular referrers to clean names
    if (host.includes('t.co') || host.includes('twitter.com')) return 'Twitter';
    if (host.includes('linkedin.com')) return 'LinkedIn';
    if (host.includes('reddit.com')) return 'Reddit';
    if (host.includes('facebook.com') || host.includes('fb.com')) return 'Facebook';
    if (host.includes('github.com')) return 'GitHub';
    if (host.includes('google.com')) return 'Google';
    
    return host;
  } catch (e) {
    return 'Referral';
  }
};

// Beautiful Glassmorphic HTML Fallback for invalid or expired links
const getHtmlErrorPage = (title, message, code = 404) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} | LynkShort</title>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: 'Outfit', sans-serif;
          background: radial-gradient(circle at center, #1e1b4b 0%, #0f172a 100%);
          color: #f1f5f9;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 20px;
        }
        .container {
          background: rgba(17, 24, 39, 0.65);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          padding: 40px 30px;
          max-width: 500px;
          width: 100%;
          text-align: center;
          box-shadow: 0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1);
          animation: float 6s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .glow {
          font-size: 72px;
          font-weight: 800;
          background: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 20px;
          letter-spacing: -2px;
        }
        h2 { font-size: 24px; margin-bottom: 12px; font-weight: 600; color: #ffffff; }
        p { font-size: 16px; color: #94a3b8; line-height: 1.6; margin-bottom: 30px; }
        .btn {
          display: inline-block;
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          color: #ffffff;
          text-decoration: none;
          padding: 12px 30px;
          border-radius: 12px;
          font-weight: 600;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
          transition: all 0.3s ease;
        }
        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.6);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="glow">${code}</div>
        <h2>${title}</h2>
        <p>${message}</p>
        <a href="/" class="btn">Back to Dashboard</a>
      </div>
    </body>
    </html>
  `;
};

// @desc    Handle server-side redirection to original URL
// @route   GET /r/:shortCode
// @access  Public
export const redirectShortUrl = async (req, res, next) => {
  try {
    const { shortCode } = req.params;

    let url = null;
    if (global.isMockDB) {
      url = await mockDb.urls.findOne({ shortCode });
    } else {
      url = await Url.findOne({ shortCode });
    }

    if (!url) {
      return res.status(404).send(getHtmlErrorPage(
        'Link Not Found', 
        'The short code you are looking for does not exist in our system or might have been deleted.',
        404
      ));
    }

    // Check link expiration
    if (url.expiresAt && new Date(url.expiresAt) <= new Date()) {
      return res.status(410).send(getHtmlErrorPage(
        'Link Has Expired',
        'This short link had an expiration date set and is no longer active. Contact the sender for an updated link.',
        410
      ));
    }

    // Perform redirect immediately to keep experience snappy!
    // Status 302 Found instructs the client/browser not to cache, keeping statistics accurate.
    res.redirect(302, url.originalUrl);

    // Asynchronously update analytics in the background (DO NOT block redirection)
    (async () => {
      try {
        const ip = anonymizeIp(req.ip || req.headers['x-forwarded-for']);
        const userAgentStr = req.headers['user-agent'] || '';
        const { browser, os, device } = parseUserAgent(userAgentStr);
        const referrer = parseReferrer(req.headers['referer'] || req.headers['referrer']);

        if (global.isMockDB) {
          // Increment click count in-memory
          await mockDb.urls.incrementClicks(url._id);
          // Create analytic log
          await mockDb.analytics.create({
            urlId: url._id,
            ip,
            userAgent: userAgentStr,
            browser,
            os,
            device,
            referrer
          });
        } else {
          // Increment click count
          await Url.findByIdAndUpdate(url._id, { $inc: { clicks: 1 } });
          // Create analytic log
          await Analytics.create({
            urlId: url._id,
            ip,
            userAgent: userAgentStr,
            browser,
            os,
            device,
            referrer
          });
        }
      } catch (analyticsError) {
        console.error('⚠️ Failed to log background analytics:', analyticsError.message);
      }
    })();

  } catch (error) {
    next(error);
  }
};
