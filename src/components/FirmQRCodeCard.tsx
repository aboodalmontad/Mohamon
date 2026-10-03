import React, { useState, useEffect } from 'react';
import { QrCode, Download, Share2, Copy, Check, Sparkles, Scale, ExternalLink } from 'lucide-react';
import { generateFirmQRCode, downloadQRCodeFile, getFirmAbsoluteUrl, shareFirmViaWhatsApp } from '../utils/qrCodeGenerator';
import { Language } from '../types';

interface FirmQRCodeCardProps {
  firmName: string;
  firmSlug: string;
  tagline?: string;
  compact?: boolean;
  themeColor?: string;
  lang?: Language;
  onOpenFullModal?: () => void;
}

export const FirmQRCodeCard: React.FC<FirmQRCodeCardProps> = ({
  firmName,
  firmSlug,
  tagline,
  compact = false,
  themeColor = '#c5a869',
  lang = 'ar',
  onOpenFullModal,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const isAr = lang === 'ar';
  const firmUrl = getFirmAbsoluteUrl(firmSlug);

  useEffect(() => {
    if (!firmUrl) return;
    generateFirmQRCode(firmUrl, {
      width: compact ? 220 : 360,
      margin: 1.5,
      darkColor: '#0f172a',
      lightColor: '#ffffff',
    }).then(setQrDataUrl);
  }, [firmUrl, compact]);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(firmUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const safeName = (firmName || 'law-firm').trim().replace(/[^a-zA-Z0-9\u0600-\u06FF]+/g, '-');
    downloadQRCodeFile(qrDataUrl, `QR-${safeName}.png`);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    shareFirmViaWhatsApp(firmName, firmUrl);
  };

  if (compact) {
    return (
      <div 
        className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-[#c5a869]/50 transition-all flex items-center gap-3.5 group"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        <div className="p-2 bg-white rounded-xl shadow-md shrink-0">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="QR Code" className="w-16 h-16 object-contain" />
          ) : (
            <div className="w-16 h-16 bg-slate-100 flex items-center justify-center text-slate-400">
              <QrCode className="w-6 h-6 animate-pulse" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 text-[11px] font-bold text-[#c5a869]">
            <Sparkles className="w-3 h-3" />
            <span>{isAr ? 'امسح لفتح المكتب' : 'Scan Firm QR'}</span>
          </div>
          <p className="text-[11px] text-white/70 line-clamp-1 mt-0.5">
            {isAr ? 'شارك رابط المكتب فوراً' : 'Instant mobile access'}
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <button
              type="button"
              onClick={handleDownload}
              className="p-1 rounded-md bg-white/10 hover:bg-[#c5a869] text-white hover:text-slate-950 transition text-[10px] font-medium flex items-center gap-1 px-1.5"
              title={isAr ? 'تحميل الباركود' : 'Download QR'}
            >
              <Download className="w-3 h-3" />
              <span>{isAr ? 'تحميل' : 'Save'}</span>
            </button>
            {onOpenFullModal && (
              <button
                type="button"
                onClick={onOpenFullModal}
                className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-white transition text-[10px] font-medium px-1.5"
              >
                {isAr ? 'تكبير' : 'Enlarge'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="p-6 rounded-3xl bg-gradient-to-b from-[#221d19] to-[#181512] border border-[#b38a38]/30 shadow-xl text-center space-y-4 relative overflow-hidden"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className="flex items-center justify-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-[#c5a869]/20 border border-[#c5a869]/40 flex items-center justify-center text-[#ebd397]">
          <Scale className="w-4 h-4" />
        </div>
        <span className="text-xs font-bold text-[#ebd397]">
          {isAr ? 'بطاقة الوصول الذكي للمكتب' : 'Firm Smart Digital Access'}
        </span>
      </div>

      <div>
        <h4 className="font-bold text-sm sm:text-base text-white font-serif-title">
          {firmName}
        </h4>
        <p className="text-[11px] text-[#d8ceb8]/70 mt-0.5">
          {isAr ? 'وجّه كاميرا هاتفك نحو الباركود لزيارة موقع المكتب فوراً' : 'Point mobile camera at QR to launch site instantly'}
        </p>
      </div>

      <div className="p-3 bg-white rounded-2xl shadow-2xl inline-block mx-auto border-2 border-[#b38a38]/40">
        {qrDataUrl ? (
          <img src={qrDataUrl} alt={`QR for ${firmName}`} className="w-40 h-40 sm:w-44 sm:h-44 object-contain rounded-lg" />
        ) : (
          <div className="w-40 h-40 flex items-center justify-center text-stone-400">
            <QrCode className="w-10 h-10 animate-pulse text-[#b38a38]" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          type="button"
          onClick={handleDownload}
          disabled={!qrDataUrl}
          className="py-2 px-3 rounded-xl bg-[#c5a869] hover:bg-[#b38a38] text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow cursor-pointer disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{isAr ? 'تحميل الباركود' : 'Download QR'}</span>
        </button>

        <button
          type="button"
          onClick={handleCopy}
          className="py-2 px-3 rounded-xl bg-[#2a241c] hover:bg-[#382f25] text-white border border-[#b38a38]/30 font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
        >
          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{isCopied ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ الرابط' : 'Copy Link')}</span>
        </button>
      </div>

      {onOpenFullModal && (
        <button
          type="button"
          onClick={onOpenFullModal}
          className="w-full py-1.5 text-[11px] text-[#ebd397] hover:text-white transition flex items-center justify-center gap-1 cursor-pointer font-medium"
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>{isAr ? 'عرض بطاقة الباركود بالحجم الكامل والطباعة' : 'View Full Card & Print'}</span>
        </button>
      )}
    </div>
  );
};

export default FirmQRCodeCard;
