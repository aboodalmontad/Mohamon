import React from 'react';
import { 
  ShieldAlert, 
  Calendar, 
  PhoneCall, 
  Mail, 
  LogIn, 
  Clock, 
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { LawFirm } from '../types';

interface FirmSuspendedNoticeProps {
  firm: LawFirm;
  reason?: 'SITE_DEACTIVATED' | 'EXPIRED' | 'SUSPENDED' | 'NOT_FOUND';
  lang: 'ar' | 'en' | 'tr';
  onOpenFirmAdmin: () => void;
  onOpenSuperAdmin?: () => void;
  onGoToMainSite?: () => void;
}

export const FirmSuspendedNotice: React.FC<FirmSuspendedNoticeProps> = ({
  firm,
  reason = 'SITE_DEACTIVATED',
  lang,
  onOpenFirmAdmin,
  onOpenSuperAdmin,
  onGoToMainSite,
}) => {
  const isAr = lang === 'ar';
  const sub = firm.subscription;

  const firmName = isAr 
    ? (firm.nameAr || firm.data?.settings?.firmNameAr || 'المكتب القانوني') 
    : (firm.nameEn || firm.data?.settings?.firmNameEn || 'Law Firm');

  const expiryDate = sub?.endDate 
    ? new Date(sub.endDate).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : null;

  const getReasonTitle = () => {
    switch (reason) {
      case 'EXPIRED':
        return isAr ? 'انتهت فترة الاشتراك السنوي لهذا الموقع' : 'Annual Subscription Expired';
      case 'SUSPENDED':
        return isAr ? 'الموقع معلق مؤقتاً من قبل إدارة المنصة' : 'Website Suspended by Administration';
      case 'SITE_DEACTIVATED':
      default:
        return isAr ? 'هذا الموقع متوقف مؤقتاً أو بانتظار التفعيل' : 'Website Temporarily Inactive or Awaiting Activation';
    }
  };

  const getReasonDescription = () => {
    switch (reason) {
      case 'EXPIRED':
        return isAr 
          ? `نعتذر لزوارنا الكرام، انتهت فترة الاشتراك والترخيص السنوي الخاص بموقع "${firmName}". يرجى من إدارة المكتب أو المحامي تجديد الاشتراك لاستئناف النشر فوراً.`
          : `The annual license and subscription for "${firmName}" has reached its expiration date. Please renew to restore live publication.`;
      case 'SUSPENDED':
        return isAr
          ? `الموقع الإلكتروني الخاص بـ "${firmName}" معلق حالياً لأسباب إدارية أو بانتظار تسوية التجديد السنوي.`
          : `The website for "${firmName}" is currently suspended for administrative review or pending renewal.`;
      case 'SITE_DEACTIVATED':
      default:
        return isAr
          ? `موقع "${firmName}" محفوظ وجاهز، لكنه في وضع الإيقاف المؤقت حالياً من قبل مالك المنصة أو المحامي. يمكن للمحامي أو مدير المكتب تسجيل الدخول لتفعيل الموقع فوراً.`
          : `The website for "${firmName}" is currently inactive. The firm manager or platform admin can log in to activate it.`;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Background radial accent */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="w-full max-w-xl bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl relative z-10 text-center">
        {/* Status Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/5">
          <ShieldAlert className="w-10 h-10" />
        </div>

        {/* Firm Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-amber-300 font-medium mb-4">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{firmName}</span>
        </div>

        {/* Headline */}
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight">
          {getReasonTitle()}
        </h1>

        {/* Notice Description */}
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6 max-w-md mx-auto">
          {getReasonDescription()}
        </p>

        {/* Details Box */}
        {sub && (
          <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4 mb-6 text-start text-xs sm:text-sm space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span>{isAr ? 'الباقة السنوية:' : 'Annual Plan:'}</span>
              <span className="font-semibold text-white">{isAr ? sub.planNameAr : sub.planNameEn}</span>
            </div>
            {expiryDate && (
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  {isAr ? 'تاريخ انتهاء الاشتراك السنوي:' : 'Annual Expiry Date:'}
                </span>
                <span className="font-mono text-amber-300 font-bold">{expiryDate}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-slate-400">
              <span>{isAr ? 'حالة الموقع الحالية:' : 'Site Live Status:'}</span>
              <span className="inline-flex items-center gap-1 text-rose-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                {isAr ? 'معلق / غير نشط' : 'Suspended / Inactive'}
              </span>
            </div>
          </div>
        )}

        {/* Actions for Lawyer / Firm Manager & Visitors */}
        <div className="space-y-3">
          {/* Lawyer / Manager Login to Activate */}
          <button
            onClick={onOpenFirmAdmin}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm sm:text-base transition-all duration-200 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            <LogIn className="w-4 h-4" />
            <span>{isAr ? 'دخول مدير المكتب لتفعيل الموقع وتجديد الاشتراك' : 'Firm Manager Login (Activate & Renew)'}</span>
          </button>

          {/* Contact Firm or Support via WhatsApp */}
          {firm.phone && (
            <a
              href={`https://wa.me/${firm.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                isAr 
                  ? `السلام عليكم، أود الاستفسار بخصوص خدمات مكتب ${firmName}.` 
                  : `Hello, I would like to inquire about services from ${firmName}.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-medium text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <span>{isAr ? `الاتصال المباشر بالمكتب (${firm.phone})` : `Contact Firm (${firm.phone})`}</span>
            </a>
          )}

          {/* Discreet Admin Login */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
            {onOpenSuperAdmin && (
              <button
                onClick={onOpenSuperAdmin}
                className="hover:text-amber-300 opacity-60 hover:opacity-100 cursor-pointer transition flex items-center gap-1 text-[11px]"
              >
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                <span>{isAr ? 'بوابة الإدارة والتجديد' : 'Administration & Renewal Portal'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
