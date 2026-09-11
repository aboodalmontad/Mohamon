import React from 'react';
import { ShieldCheck, Scale, Award, ArrowLeft, ArrowRight, Building, Landmark, ChevronDown } from 'lucide-react';
import { SiteSettings, Language } from '../types';
import { useTranslation, getLocalized } from '../services/i18n';

interface HeroSectionProps {
  settings: SiteSettings;
  lang: Language;
  onOpenConsultation: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  settings,
  lang,
  onOpenConsultation,
}) => {
  const isRtl = lang === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;
  const t = useTranslation(lang);

  const firmName = getLocalized(settings, 'firmName', lang, settings.firmNameAr);
  const slogan = getLocalized(settings, 'slogan', lang, settings.sloganAr);
  const subSlogan = getLocalized(settings, 'subSlogan', lang, settings.subSloganAr);

  return (
    <section id="hero" className="relative min-h-[92vh] flex items-center justify-center pt-28 pb-16 overflow-hidden bg-gradient-to-b from-[#fbf8f2] via-[#f7f2e7] to-[#f3ebd9]">
      {/* Background Image with Warm Soft Champagne Tint */}
      <div className="absolute inset-0 z-0 opacity-15">
        <img
          src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=2000"
          alt="Courthouse & Legal Scale Background"
          className="w-full h-full object-cover object-center filter contrast-[1.1] scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#fbf8f2] via-[#fbf8f2]/80 to-transparent" />
      </div>

      {/* Subtle gold grid lines accent */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#b38a3812_1px,transparent_1px),linear-gradient(to_bottom,#b38a3812_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className={`relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col ${
        settings.heroAlignment === 'start' 
          ? 'text-right rtl:text-right ltr:text-left items-start' 
          : 'text-center items-center'
      }`}>
        {/* Firm Custom Logo or Prestige Badge */}
        {settings.logoSizeHero !== 'hidden' && (
          settings.customLogoUrl ? (
            <div className={`flex flex-col mb-6 animate-fade-in ${
              settings.heroAlignment === 'start' ? 'items-start' : 'items-center'
            }`}>
              {(() => {
                const heroSizeMap = {
                  sm: 'w-16 h-16 sm:w-20 sm:h-20',
                  md: 'w-20 h-20 sm:w-28 sm:h-28',
                  lg: 'w-28 h-28 sm:w-36 sm:h-36',
                  xl: 'w-36 h-36 sm:w-44 sm:h-44',
                };
                const sizeClass = heroSizeMap[settings.logoSizeHero || 'md'];

                const shapeClass = settings.logoShape === 'circle'
                  ? 'rounded-full'
                  : settings.logoShape === 'square'
                  ? 'rounded-none'
                  : settings.logoShape === 'transparent'
                  ? 'rounded-none bg-transparent shadow-none p-0 border-none'
                  : 'rounded-2xl sm:rounded-3xl';

                const innerShapeClass = settings.logoShape === 'circle'
                  ? 'rounded-full'
                  : settings.logoShape === 'square'
                  ? 'rounded-none'
                  : settings.logoShape === 'transparent'
                  ? 'bg-transparent'
                  : 'rounded-[14px] sm:rounded-[22px]';

                if (settings.logoShape === 'transparent') {
                  return (
                    <div className={`${sizeClass} flex items-center justify-center overflow-hidden hover:scale-105 transition-transform duration-300`}>
                      <img src={settings.customLogoUrl} alt={firmName} className="w-full h-full object-contain" />
                    </div>
                  );
                }

                return (
                  <div className={`${sizeClass} ${shapeClass} bg-gradient-to-br from-[#c5a869] to-[#8d6f2c] p-1 shadow-2xl hover:scale-105 transition-transform duration-300`}>
                    <div className={`w-full h-full bg-[#fbf8f2] ${innerShapeClass} flex items-center justify-center overflow-hidden p-1.5`}>
                      <img src={settings.customLogoUrl} alt={firmName} className="w-full h-full object-contain" />
                    </div>
                  </div>
                );
              })()}
              <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#b38a38]/12 border border-[#b38a38]/35 text-[#87641d] text-xs font-semibold mt-3 shadow-sm">
                <Award className="w-3.5 h-3.5 text-[#b38a38]" />
                <span>{firmName}</span>
              </div>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#b38a38]/12 border border-[#b38a38]/35 text-[#87641d] text-xs sm:text-sm font-semibold mb-6 shadow-sm backdrop-blur-md animate-fade-in">
              <Award className="w-4 h-4 text-[#b38a38]" />
              <span>{t.heroTag}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#b38a38]" />
            </div>
          )
        )}

        {/* Main Headline (Dynamic Slogan from Site Settings) */}
        {(() => {
          const headlineSizeMap = {
            sm: 'text-2xl sm:text-4xl md:text-5xl',
            md: 'text-3xl sm:text-5xl md:text-6xl',
            lg: 'text-3xl sm:text-5xl md:text-6xl lg:text-7xl',
            xl: 'text-4xl sm:text-6xl md:text-7xl lg:text-8xl',
          };
          const headlineSizeClass = headlineSizeMap[settings.firmNameSizeHero || 'lg'];
          const lineClass = settings.heroHeadlineLines === '1'
            ? 'line-clamp-1'
            : settings.heroHeadlineLines === '2'
            ? 'line-clamp-2'
            : settings.heroHeadlineLines === '3'
            ? 'line-clamp-3'
            : '';

          return (
            <h1 className={`${headlineSizeClass} ${lineClass} font-hero-headline font-bold text-[#181512] tracking-tight leading-[1.25] sm:leading-[1.2] max-w-5xl mb-6`}>
              {slogan}
            </h1>
          );
        })()}

        {/* Subtitle */}
        {(() => {
          const subLineClass = settings.heroSubheadlineLines === '1'
            ? 'line-clamp-1'
            : settings.heroSubheadlineLines === '2'
            ? 'line-clamp-2'
            : settings.heroSubheadlineLines === '3'
            ? 'line-clamp-3'
            : '';

          return (
            <p className={`text-base sm:text-lg md:text-xl text-[#4b4334] max-w-3xl leading-relaxed mb-10 font-normal ${subLineClass}`}>
              {subSlogan}
            </p>
          );
        })()}

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-16">
          <button
            onClick={onOpenConsultation}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[#b38a38] via-[#c5a869] to-[#87641d] text-white font-bold text-base shadow-[0_4px_20px_rgba(179,138,56,0.35)] hover:shadow-[0_6px_25px_rgba(179,138,56,0.5)] transition duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 cursor-pointer"
          >
            <Scale className="w-5 h-5 text-white" />
            <span>{t.heroCtaPrimary}</span>
            <ArrowIcon className="w-4 h-4" />
          </button>

          <a
            href="#practice-areas"
            className="w-full sm:w-auto px-7 py-4 rounded-xl bg-white text-[#181512] hover:text-[#87641d] hover:border-[#b38a38] transition duration-300 font-bold text-base flex items-center justify-center gap-2 border border-[#d8ceb8] shadow-sm"
          >
            <span>{t.heroCtaSecondary}</span>
          </a>
        </div>

        {/* Live Counter Statistics Bar */}
        <div className="w-full max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 p-6 rounded-2xl bg-white/95 backdrop-blur-md border border-[#c5a869]/30 shadow-xl">
          {/* Stat 1 */}
          <div className="flex flex-col items-center p-3 text-center border-b md:border-b-0 md:border-l rtl:md:border-l-0 rtl:md:border-r border-[#e6ddcc]">
            <span className="text-3xl sm:text-4xl lg:text-5xl font-serif-title font-extrabold gold-gradient-text tracking-tight">
              +{settings?.stats?.yearsExperience ?? 28}
            </span>
            <span className="text-xs sm:text-sm text-[#4b4334] mt-1 font-semibold">
              {t.statsYears}
            </span>
          </div>

          {/* Stat 2 */}
          <div className="flex flex-col items-center p-3 text-center border-b md:border-b-0 md:border-l rtl:md:border-l-0 rtl:md:border-r border-[#e6ddcc]">
            <span className="text-3xl sm:text-4xl lg:text-5xl font-serif-title font-extrabold text-[#181512] tracking-tight">
              +{Number(settings?.stats?.casesWon ?? 1850).toLocaleString()}
            </span>
            <span className="text-xs sm:text-sm text-[#4b4334] mt-1 font-semibold">
              {t.statsCases}
            </span>
          </div>

          {/* Stat 3 */}
          <div className="flex flex-col items-center p-3 text-center md:border-l rtl:md:border-l-0 rtl:md:border-r border-[#e6ddcc]">
            <span className="text-3xl sm:text-4xl lg:text-5xl font-serif-title font-extrabold gold-gradient-text tracking-tight">
              ${settings?.stats?.recoveredMillionsUSD ?? 850}M+
            </span>
            <span className="text-xs sm:text-sm text-[#4b4334] mt-1 font-semibold">
              {t.statsCapital}
            </span>
          </div>

          {/* Stat 4 */}
          <div className="flex flex-col items-center p-3 text-center">
            <span className="text-3xl sm:text-4xl lg:text-5xl font-serif-title font-extrabold text-[#87641d] tracking-tight">
              %{settings?.stats?.successRate ?? 98}
            </span>
            <span className="text-xs sm:text-sm text-[#4b4334] mt-1 font-semibold">
              {t.statsRate}
            </span>
          </div>
        </div>

        {/* Global Accreditations Strip */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-[#5c5343] text-xs sm:text-sm border-t border-[#e6ddcc] pt-6 w-full max-w-4xl">
          <span className="text-[#87641d] font-bold">
            {lang === 'ar' ? 'اعتمادات وشراكات دولية:' : lang === 'tr' ? 'Uluslararası Akreditasyonlar & Kurumlar:' : 'Accreditations & Affiliations:'}
          </span>
          <div className="flex items-center gap-2 text-[#3b352b] font-medium">
            <ShieldCheck className="w-4 h-4 text-[#b38a38]" />
            <span>{lang === 'ar' ? 'وزارة العدل' : lang === 'tr' ? 'Adalet Bakanlığı' : 'Ministry of Justice'}</span>
          </div>
          <div className="flex items-center gap-2 text-[#3b352b] font-medium">
            <Landmark className="w-4 h-4 text-[#b38a38]" />
            <span>ICC Paris International Arbitration</span>
          </div>
          <div className="flex items-center gap-2 text-[#3b352b] font-medium">
            <Building className="w-4 h-4 text-[#b38a38]" />
            <span>SCCA / ISTAC Arbitration</span>
          </div>
          <div className="flex items-center gap-2 text-[#3b352b] font-medium">
            <Award className="w-4 h-4 text-[#b38a38]" />
            <span>IBA International Bar Association</span>
          </div>
        </div>

        {/* Scroll indicator */}
        <a href="#about" className="mt-8 text-[#87641d] hover:text-[#b38a38] transition animate-bounce" aria-label="Scroll to About Section">
          <ChevronDown className="w-6 h-6" />
        </a>
      </div>
    </section>
  );
};
