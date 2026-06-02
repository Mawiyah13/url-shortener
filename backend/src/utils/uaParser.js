/**
 * Parses user-agent string to extract browser, OS, and device.
 * @param {string} uaString 
 * @returns {{ browser: string, os: string, device: string }}
 */
export const parseUserAgent = (uaString) => {
  if (!uaString) {
    return { browser: 'Unknown', os: 'Unknown', device: 'Desktop' };
  }

  let browser = 'Unknown';
  let os = 'Unknown';
  let device = 'Desktop';

  // 1. Detect Device
  const uaLower = uaString.toLowerCase();
  if (/mobi|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(uaLower)) {
    device = 'Mobile';
  }
  if (/ipad|tablet|playbook|silk/i.test(uaLower)) {
    device = 'Tablet';
  }
  if (/bot|crawl|spider|slurp|facebookexternalhit|mediapartners-google/i.test(uaLower)) {
    device = 'Bot';
  }

  // 2. Detect OS
  if (/windows/i.test(uaString)) {
    os = 'Windows';
  } else if (/macintosh|mac os x/i.test(uaString)) {
    // Exclude iOS devices which might have Macintosh in user agent sometimes
    if (/iphone|ipad|ipod/i.test(uaString)) {
      os = 'iOS';
    } else {
      os = 'macOS';
    }
  } else if (/iphone|ipad|ipod/i.test(uaString)) {
    os = 'iOS';
  } else if (/android/i.test(uaString)) {
    os = 'Android';
  } else if (/linux/i.test(uaString)) {
    os = 'Linux';
  }

  // 3. Detect Browser
  if (/opr\/|opera/i.test(uaString)) {
    browser = 'Opera';
  } else if (/edg/i.test(uaString)) {
    browser = 'Edge';
  } else if (/chrome|crios/i.test(uaString)) {
    // Edge & Opera also contain Chrome in their UA
    browser = 'Chrome';
  } else if (/firefox|fxios/i.test(uaString)) {
    browser = 'Firefox';
  } else if (/safari/i.test(uaString) && !/chrome|crios|chromium/i.test(uaString)) {
    browser = 'Safari';
  }

  return { browser, os, device };
};

export default parseUserAgent;
