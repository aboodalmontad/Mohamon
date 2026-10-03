import React, { useState, useEffect } from 'react';
import { 
  X, QrCode, Download, Copy, Check, Share2, Printer, 
  ExternalLink, Sparkles, ShieldCheck, Scale, Globe2, Phone, MapPin 
} from 'lucide-react';
import { generateFirmQRCode, downloadQRCodeFile, getFirmAbsoluteUrl, shareFirmViaWhatsApp } from '../utils/qrCodeGenerator';
import { Language } from '../types';

interface FirmQRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  firmName: string;
  firmSlug: string;
  tagline?: string;
  city?: string;
  phone?: string;
  logoUrl?: string;
  themeColor?: string;
  lang?: Language;
}

export const FirmQRCodeModal: React.FC<FirmQRCodeModalProps> = ({
  isOpen,
  onClose,
  firmName,
  firmSlug,
  tagline,
  city,
  phone,
  logoUrl,
  themeColor = '#c5a869',
  lang = 'ar',
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(true);

  const isAr = lang === 'ar';
  const firmUrl = getFirmAbsoluteUrl(firmSlug);

  useEffect(() => {
    if (!isOpen || !firmUrl) return;

    setIsGenerating(true);
    // Generate high-resolution QR Code
    generateFirmQRCode(firmUrl, {
      width: 500,
      margin: 2,
      darkColor: '#0f172a',
      lightColor: '#ffffff',
    }).then((data) => {
      setQrDataUrl(data);
      setIsGenerating(false);
    });
  }, [isOpen, firmUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(firmUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleDownload = () => {
    const safeName = (firmName || 'law-firm').trim().replace(/[^a-zA-Z0-9\u0600-\u06FF]+/g, '-');
    downloadQRCodeFile(qrDataUrl, `QR-${safeName}.png`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    shareFirmViaWhatsApp(firmName, firmUrl);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in print:p-0 print:bg-white">
      <div 
        className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl text-slate-100 overflow-hidden my-auto print:border-none print:shadow-none print:bg-white print:text-black"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Header bar (hidden in print) */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2.5">
            <div 
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-950 shadow-md font-bold"
              style={{ backgroundColor: themeColor }}
            >
              <QrCode className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5 font-serif-title">
                <span>{isAr ? 'الباركود الذكي لصفحة المكتب' : 'Smart Digital Firm QR Code'}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#c5a869]/20 text-[#ebd397] border border-[#c5a869]/30">
                  QR Access
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                {isAr ? 'امسح الباركود بكاميرا الهاتف لفتح موقع المكتب مباشرة' : 'Scan with mobile camera to instantly access firm site'}
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Printable Card Body */}
        <div className="p-6 space-y-5 print:p-8">
          {/* Card Presentation */}
          <div className="bg-gradient-to-b from-slate-950 to-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 text-center space-y-4 shadow-inner relative overflow-hidden print:bg-white print:border-stone-300">
            {/* Top decorative badge */}
            <div className="flex items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#c5a869]/15 text-[#ebd397] border border-[#c5a869]/30">
                <ShieldCheck className="w-3.5 h-3.5 text-[#c5a869]" />
                <span>{isAr ? 'مكتب محاماة معتمد ومرخص' : 'Verified & Licensed Law Firm'}</span>
              </span>
            </div>

            {/* Firm Name & Tagline */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-serif-title text-white print:text-black">
                {firmName}
              </h2>
              {tagline && (
                <p className="text-xs text-slate-400 print:text-stone-600 mt-1 max-w-sm mx-auto line-clamp-2 leading-relaxed">
                  {tagline}
                </p>
              )}
            </div>

            {/* QR Code Container */}
            <div className="relative inline-block mx-auto">
              <div className="p-4 bg-white rounded-2xl shadow-xl border-4 border-slate-800 print:border-stone-400 inline-flex items-center justify-center">
                {isGenerating ? (
                  <div className="w-48 h-48 sm:w-56 sm:h-56 flex flex-col items-center justify-center gap-3 text-slate-500">
                    <div className="w-8 h-8 border-3 border-[#c5a869] border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs">{isAr ? 'جاري توليد الباركود...' : 'Generating QR code...'}</span>
                  </div>
                ) : qrDataUrl ? (
                  <img 
                    src={qrDataUrl} 
                    alt={`QR Code for ${firmName}`} 
                    className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-lg"
                  />
                ) : null}
              </div>

              {/* Watermark badge in the bottom right of QR */}
              <div 
                className="absolute -bottom-2 -right-2 p-1.5 rounded-xl shadow-lg border border-slate-700 bg-slate-900 text-slate-100 flex items-center gap-1 text-[10px] font-mono font-bold print:hidden"
              >
                <Scale className="w-3.5 h-3.5 text-[#c5a869]" />
                <span>SCAN ME</span>
              </div>
            </div>

            {/* Scanner Hint */}
            <div className="text-xs text-slate-300 print:text-stone-700 flex items-center justify-center gap-1.5 pt-1">
              <Sparkles className="w-3.5 h-3.5 text-[#c5a869]" />
              <span>
                {isAr 
                  ? 'وجّه كاميرا هاتفك الذكي نحو الباركود لزيارة المكتب فوراً'
                  : 'Point smartphone camera at QR code to open firm instantly'}
              </span>
            </div>

            {/* Firm Meta info (City, Phone, Domain) */}
            <div className="pt-3 border-t border-slate-800/80 print:border-stone-200 flex items-center justify-center gap-4 text-xs text-slate-400 print:text-stone-600 flex-wrap">
              {city && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#c5a869]" />
                  <span>{city}</span>
                </div>
              )}
              {phone && (
                <div className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-[#c5a869]" />
                  <span className="ltr font-mono">{phone}</span>
                </div>
              )}
            </div>

            {/* Direct Firm URL block */}
            <div className="bg-slate-950/80 print:bg-stone-100 border border-slate-800 print:border-stone-300 rounded-xl p-2.5 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 overflow-hidden text-slate-300 print:text-stone-800">
                <Globe2 className="w-4 h-4 text-[#c5a869] shrink-0" />
                <span className="truncate ltr font-mono text-[11px]">{firmUrl}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className="shrink-0 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 print:bg-white text-slate-200 print:text-stone-800 transition flex items-center gap-1 text-[11px] font-medium cursor-pointer"
                title={isAr ? 'نسخ الرابط' : 'Copy link'}
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">{isAr ? 'تم النسخ!' : 'Copied!'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{isAr ? 'نسخ' : 'Copy'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Action Buttons (Download, Print, Share) - hidden in print */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 print:hidden">
            <button
              type="button"
              onClick={handleDownload}
              disabled={!qrDataUrl}
              className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#c5a869] to-[#87641d] hover:brightness-110 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isAr ? 'تحميل صورة الباركود' : 'Download PNG'}</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>{isAr ? 'مشاركة عبر واتساب' : 'WhatsApp Share'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#c5a869]" />
              <span>{isAr ? 'طباعة البطاقة' : 'Print Card'}</span>
            </button>
          </div>

          {/* Practical guide for the lawyer */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 leading-relaxed print:hidden">
            <span className="font-bold text-slate-300 block mb-1">
              💡 {isAr ? 'نصيحة للمحامي:' : 'Lawyer Marketing Tip:'}
            </span>
            {isAr 
              ? 'يمكنك طباعة هذا الباركود ووضعه على كروت العمل (Business Cards)، المطبوعات الرسمية، لافتة الاستقبال في مكتبك، أو نشره على شبكات التواصل لتمكين الموكلين من الوصول المباشر لموقعك واستشاراتك.'
              : 'Print this QR code on your legal stationery, business cards, office lobby display, or social media to allow clients instant direct access.'}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between print:hidden">
          <a
            href={firmUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#ebd397] hover:underline flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>{isAr ? 'فتح صفحة المكتب في نافذة جديدة' : 'Open live firm site'}</span>
          </a>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition cursor-pointer"
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FirmQRCodeModal;
