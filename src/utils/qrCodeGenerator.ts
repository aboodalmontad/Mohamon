import QRCode from 'qrcode';

export interface QRCodeOptions {
  width?: number;
  margin?: number;
  darkColor?: string;
  lightColor?: string;
}

/**
 * Returns the absolute direct URL for a specific firm
 */
export function getFirmAbsoluteUrl(firmSlug?: string): string {
  if (typeof window === 'undefined') return '';
  const origin = window.location.origin;
  const pathname = window.location.pathname;
  if (!firmSlug) return `${origin}${pathname}`;
  return `${origin}${pathname}?firm=${encodeURIComponent(firmSlug)}`;
}

/**
 * Generates high-res PNG Data URL for a given URL or text
 */
export async function generateFirmQRCode(
  urlOrText: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const width = options.width || 400;
  const margin = options.margin !== undefined ? options.margin : 2;
  const darkColor = options.darkColor || '#0f172a'; // Deep obsidian/navy for maximum contrast
  const lightColor = options.lightColor || '#ffffff';

  try {
    return await QRCode.toDataURL(urlOrText, {
      width,
      margin,
      color: {
        dark: darkColor,
        light: lightColor,
      },
      errorCorrectionLevel: 'H', // High error correction level allows high reliability and scanning
    });
  } catch (err) {
    console.error('Error generating QR code:', err);
    return '';
  }
}

/**
 * Triggers a direct download of the QR code image
 */
export function downloadQRCodeFile(dataUrl: string, fileName = 'firm-qr-code.png'): void {
  if (!dataUrl) return;
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName.endsWith('.png') ? fileName : `${fileName}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Shares the firm link with message via WhatsApp
 */
export function shareFirmViaWhatsApp(firmName: string, firmUrl: string): void {
  const text = encodeURIComponent(
    `يسرنا دعوتكم لزيارة الموقع الرسمي لمكتب ${firmName} للاطلاع على خدماتنا واستشاراتنا القانونية:\n${firmUrl}`
  );
  window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
}
