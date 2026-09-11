import React from 'react';
import { Scale, Phone, Mail, MapPin, Linkedin, Twitter, Youtube, ArrowUp, Lock, RefreshCw, ShieldCheck } from 'lucide-react';
import { SiteSettings, PracticeArea, Language } from '../types';
import { useTranslation, getLocalized } from '../services/i18n';

interface FooterProps {
  settings: SiteSettings;
  practiceAreas: PracticeArea[];
  lang: Language;
  onOpenConsultation: (practiceId?: string) => void;
  onOpenAdmin: () => void;
  onOpenSuperAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  practiceAreas,
  lang,
  onOpenConsultation,
  onOpenAdmin,
  onOpenSuperAdmin,
}) => {
  const t = useTranslation(lang);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const firmName = getLocalized(settings, 'firmName', lang, settings.firmNameAr);
  const slogan = getLocalized(settings, 'slogan', lang, settings.sloganAr);
  const subSlogan = getLocalized(settings, 'subSlogan', lang, settings.subSloganAr || settings.aboutTextAr);
  const address = getLocalized(settings, 'address', lang, settings.addressAr);

  return (
    <footer className="bg-[#181512] text-[#d8ceb8] text-xs border-t border-[#b38a38]/30 relative">
      {/* Top CTA Banner */}
      <div className="border-b border-[#2c261e] py-12 bg-[#221d19]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-[#c5a869] font-bold text-xs tracking-wider uppercase block mb-1">
              {lang === 'ar' ? 'تمثيل قانوني رفيع المستوى' : lang === 'tr' ? '1. Sınıf Hukuki Temsil' : 'Tier-1 Legal Representation'}
            </span>
            <h3 className="text-xl sm:text-2xl font-serif-title font-bold text-white">
              {lang === 'ar' 
                ? 'هل تواجه نزاعاً استثمارياً أو تخطط لصفقة اندماج كبرى؟' 
                : lang === 'tr'
                ? 'Büyük bir tahkim uyuşmazlığıyla mı karşı karşıyasınız veya önemli bir M&A birleşmesi mi planlıyorsunuz?'
                : 'Facing high-stakes arbitration or planning a major M&A deal?'}
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`tel:${settings.emergencyPhone}`}
              className="px-5 py-3 rounded-xl border border-[#b38a38]/40 hover:border-[#b38a38] text-white font-semibold flex items-center gap-2 transition bg-[#181512]"
            >
              <Phone className="w-4 h-4 text-[#c5a869]" />
              <span className="ltr font-mono">{settings.emergencyPhone}</span>
            </a>

            <button
              onClick={() => onOpenConsultation()}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#b38a38] via-[#c5a869] to-[#87641d] text-white font-bold shadow-lg hover:brightness-110 transition cursor-pointer"
            >
              {t.bookConsultation}
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Col 1 & 2: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              {(() => {
                const shapeClass = settings.logoShape === 'circle'
                  ? 'rounded-full'
                  : settings.logoShape === 'square'
                  ? 'rounded-none'
                  : settings.logoShape === 'transparent'
                  ? 'rounded-none bg-transparent shadow-none p-0 border-none'
                  : 'rounded-xl';

                const innerShapeClass = settings.logoShape === 'circle'
                  ? 'rounded-full'
                  : settings.logoShape === 'square'
                  ? 'rounded-none'
                  : settings.logoShape === 'transparent'
                  ? 'bg-transparent'
                  : 'rounded-[10px]';

                if (settings.logoShape === 'transparent') {
                  return (
                    <div className="w-10 h-10 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {settings.customLogoUrl ? (
                        <img src={settings.customLogoUrl} alt={firmName} className="w-full h-full object-contain" />
                      ) : (
                        <Scale className="w-6 h-6 text-[#c5a869]" />
                      )}
                    </div>
                  );
                }

                return (
                  <div className={`w-11 h-11 ${shapeClass} bg-gradient-to-br from-[#c5a869] to-[#87641d] p-0.5 shadow-lg flex-shrink-0`}>
                    <div className={`w-full h-full bg-[#181512] ${innerShapeClass} flex items-center justify-center overflow-hidden p-0.5`}>
                      {settings.customLogoUrl ? (
                        <img src={settings.customLogoUrl} alt={firmName} className="w-full h-full object-contain" />
                      ) : (
                        <Scale className="w-6 h-6 text-[#c5a869]" />
                      )}
                    </div>
                  </div>
                );
              })()}
              <div>
                <span className="font-firm-name font-bold text-base text-white block">
                  {firmName}
                </span>
                <span className="text-[10px] text-[#c5a869] font-medium font-navbar-brand">
                  {slogan}
                </span>
              </div>
            </div>

            <p className="text-[#d8ceb8]/90 leading-relaxed text-xs max-w-sm">
              {subSlogan}
            </p>

            <div className="pt-2 flex items-center gap-3">
              <a
                href={settings.socialLinks.linkedin}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-[#2c261e] border border-[#3d352b] hover:border-[#c5a869] text-[#d8ceb8] hover:text-[#c5a869] flex items-center justify-center transition"
                title="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href={settings.socialLinks.twitter}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-[#2c261e] border border-[#3d352b] hover:border-[#c5a869] text-[#d8ceb8] hover:text-[#c5a869] flex items-center justify-center transition"
                title="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href={settings.socialLinks.youtube}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-[#2c261e] border border-[#3d352b] hover:border-[#c5a869] text-[#d8ceb8] hover:text-[#c5a869] flex items-center justify-center transition"
                title="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 3: Practice Areas */}
          <div>
            <h4 className="font-bold text-white text-sm mb-4">
              {t.navPracticeAreas}
            </h4>
            <ul className="space-y-2.5">
              {practiceAreas.slice(0, 5).map((p) => (
                <li key={p.id}>
                  <button
                    onClick={() => onOpenConsultation(p.id)}
                    className="hover:text-[#c5a869] transition text-start text-[#d8ceb8] cursor-pointer"
                  >
                    {getLocalized(p, 'title', lang, p.title)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Quick Navigation */}
          <div>
            <h4 className="font-bold text-white text-sm mb-4">
              {lang === 'ar' ? 'روابط سريعة' : lang === 'tr' ? 'Hızlı Bağlantılar' : 'Quick Links'}
            </h4>
            <ul className="space-y-2.5">
              <li><a href="#about" className="hover:text-[#c5a869] transition">{t.navAbout}</a></li>
              <li><a href="#partners" className="hover:text-[#c5a869] transition">{t.navPartners}</a></li>
              <li><a href="#why-us" className="hover:text-[#c5a869] transition">{t.navWhyUs}</a></li>
              <li><a href="#achievements" className="hover:text-[#c5a869] transition">{t.navAchievements}</a></li>
              <li><a href="#testimonials" className="hover:text-[#c5a869] transition">{t.navTestimonials}</a></li>
              <li><a href="#blog" className="hover:text-[#c5a869] transition">{t.navBlog}</a></li>
            </ul>
          </div>

          {/* Col 5: Headquarter Info */}
          <div>
            <h4 className="font-bold text-white text-sm mb-4">
              {lang === 'ar' ? 'المقر الرئيسي' : lang === 'tr' ? 'Genel Merkez' : 'Headquarters'}
            </h4>
            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#c5a869] flex-shrink-0 mt-0.5" />
                <div className={`text-[#d8ceb8] ${
                  settings.addressLinesCount === '1'
                    ? 'line-clamp-1 truncate'
                    : settings.addressLinesCount === '2'
                    ? 'line-clamp-2'
                    : settings.addressLinesCount === '3'
                    ? 'line-clamp-3'
                    : ''
                }`}>
                  {(() => {
                    if (settings.addressDisplayMode === 'multiline' && address.includes('\n')) {
                      return address.split('\n').map((line, i) => (
                        <span key={i} className="block leading-relaxed">{line}</span>
                      ));
                    }
                    return <span>{address}</span>;
                  })()}
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#c5a869] flex-shrink-0" />
                <a href={`tel:${settings.phone}`} className="hover:text-[#c5a869] font-mono ltr text-[#d8ceb8]">
                  {settings.phone}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#c5a869] flex-shrink-0" />
                <a href={`mailto:${settings.email}`} className="hover:text-[#c5a869] text-[#d8ceb8]">
                  {settings.email}
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Legal Disclaimer Box */}
        <div className="mt-12 p-4 rounded-xl bg-[#221d19] border border-[#2c261e] text-[11px] text-[#d8ceb8]/80 leading-relaxed">
          <p>
            {t.footerDisclaimer}
          </p>
        </div>

        {/* Bottom copyright & Admin entrance */}
        <div className="mt-8 pt-6 border-t border-[#2c261e] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#d8ceb8]/80">
          <div className="flex items-center gap-3">
            <span>© {new Date().getFullYear()} {firmName}. {t.allRightsReserved}</span>
            <span className="bg-[#2c261e] text-[#c5a869] px-2 py-0.5 rounded text-[10px] font-mono border border-[#c5a869]/20" title="رقم الإصدار">
              الإصدار: 11-9-2026
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (confirm(t.refreshConfirm)) {
                  localStorage.clear();
                  sessionStorage.clear();
                  if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.getRegistrations().then(registrations => {
                      for (let registration of registrations) {
                        registration.unregister();
                      }
                    });
                  }
                  window.location.reload();
                }
              }}
              className="text-[#d8ceb8] hover:text-[#c5a869] flex items-center gap-1 transition cursor-pointer"
              title={t.refreshApp}
            >
              <RefreshCw className="w-3 h-3 text-[#c5a869]" />
              <span>{t.refreshApp}</span>
            </button>

            <button
              onClick={onOpenAdmin}
              className="text-[#d8ceb8] hover:text-[#c5a869] flex items-center gap-1 transition cursor-pointer"
            >
              <Lock className="w-3 h-3" />
              <span>{t.adminPanel}</span>
            </button>

            {onOpenSuperAdmin && (
              <button
                onClick={onOpenSuperAdmin}
                className="text-[#d8ceb8]/70 hover:text-amber-400 flex items-center gap-1 transition cursor-pointer text-[10px] bg-[#221d19] px-2.5 py-1 rounded-md border border-amber-500/20"
                title={lang === 'ar' ? 'لوحة تحكم مدير المنصة واشتراكات المكاتب السحابية' : 'Platform Owner Console'}
              >
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                <span>{lang === 'ar' ? 'إدارة المنصة' : 'Platform'}</span>
              </button>
            )}

            <button
              onClick={scrollToTop}
              className="p-2 rounded-lg bg-[#2c261e] hover:bg-[#c5a869] text-[#d8ceb8] hover:text-[#181512] transition cursor-pointer"
              title="Scroll to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
