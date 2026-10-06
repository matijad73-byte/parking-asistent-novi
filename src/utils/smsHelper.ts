/**
 * Helper to clean and format license plate for regional SMS parking systems.
 * Regional parking gates (Beograd, Novi Sad, etc.) expect clean uppercase without spaces or hyphens,
 * e.g. "BG 123-AB" -> "BG123AB".
 */
export function cleanPlateForSms(plate: string): string {
  if (!plate) return '';
  return plate
    .toUpperCase()
    .replace(/[^A-Z0-9ŠĐČĆŽ]/g, '')
    .trim();
}

/**
 * Generates direct SMS URI for Android & modern mobile browsers.
 * Android standard: sms:<number>?body=<message>
 * iOS standard fallback: sms:<number>&body=<message>
 */
export function generateSmsUri(smsNumber: string, plate: string): string {
  const cleanBody = cleanPlateForSms(plate);
  const encodedBody = encodeURIComponent(cleanBody);
  // Standard RFC 5724 format that works across modern Android & web apps
  return `sms:${smsNumber}?body=${encodedBody}`;
}

/**
 * Triggers native SMS app directly
 */
export function triggerNativeSms(smsNumber: string, plate: string): void {
  const cleanBody = cleanPlateForSms(plate);
  const isIos = typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const delimiter = isIos ? '&' : '?';
  const url = `sms:${smsNumber}${delimiter}body=${encodeURIComponent(cleanBody)}`;

  // Open the SMS protocol
  window.location.href = url;
}
