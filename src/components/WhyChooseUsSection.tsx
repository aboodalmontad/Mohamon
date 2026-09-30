import React from 'react';
import {
  Lock, Trophy, Clock, Globe2, ShieldCheck, FileCheck2, Award,
  Scale, Building2, Gavel, Briefcase, Landmark, Sparkles, Target, Compass
} from 'lucide-react';
import { Language, SiteSettings, WhyChooseUsPillar } from '../types';
import { DEFAULT_WHY_PILLARS } from '../data/initialData';
import { useTranslation, getLocalized } from '../services/i18n';

interface WhyChooseUsProps {
  lang: Language;
  settings?: SiteSettings;
}

const renderPillarIcon = (iconName: string) => {
  const cls = 'w-7 h-7 text-[#c5a869]';
  switch (iconName) {
    case 'Lock':
      return <Lock className={cls} />;
    case 'Trophy':
      return <Trophy className={cls} />;
    case 'Globe2':
    case 'Globe':
      return <Globe2 className={cls} />;
    case 'Clock':
      return <Clock className={cls} />;
    case 'FileCheck2':
      return <FileCheck2 className={cls} />;
    case 'ShieldCheck':
      return <ShieldCheck className={cls} />;
    case 'Scale':
      return <Scale className={cls} />;
    case 'Building2':
      return <Building2 className={cls} />;
    case 'Gavel':
      return <Gavel className={cls} />;
    case 'Briefcase':
      return <Briefcase className={cls} />;
    case 'Landmark':
      return <Landmark className={cls} />;
    case 'Sparkles':
      return <Sparkles className={cls} />;
    case 'Target':
      return <Target className={cls} />;
    case 'Compass':
      return <Compass className={cls} />;
    case 'Award':
    default:
      return <Award className={cls} />;
  }
};

export const WhyChooseUsSection: React.FC<WhyChooseUsProps> = React.memo(({ lang, settings }) => {
  const t = useTranslation(lang);

  const pillars: WhyChooseUsPillar[] =
    settings?.whyPillars && Array.isArray(settings.whyPillars) && settings.whyPillars.length > 0
      ? settings.whyPillars
      : DEFAULT_WHY_PILLARS;

  const badgeText = getLocalized(settings, 'whyBadge', lang, t.whyBadge);
  const subtitleText = getLocalized(settings, 'whySubtitle', lang, t.whySubtitle);
  const customHeading = settings?.whyHeadingAr ? getLocalized(settings, 'whyHeading', lang, '') : '';

  const defaultHeadingAr = 'لماذا تضع كبرى الشركات ثقتها المطلقة في مكتبنا؟';
  const defaultHeadingEn = 'Why Global Corporations Entrust Us With Their Critical Stakes';
  const defaultHeadingTr = 'Küresel Şirketler Neden En Kritik Dosyalarını Bize Emanet Ediyor?';

  const isDefaultHeading =
    !customHeading ||
    customHeading === defaultHeadingAr ||
    customHeading === defaultHeadingEn ||
    customHeading === defaultHeadingTr;

  return (
    <section id="why-us" className="py-24 bg-[#fbf8f2] relative border-t border-[#e6ddcc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#b38a38]/12 border border-[#b38a38]/30 text-[#87641d] text-xs font-bold uppercase tracking-wider mb-4">
            <Award className="w-3.5 h-3.5" />
            <span>{badgeText}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif-title font-bold text-[#181512] tracking-tight mb-4">
            {!isDefaultHeading ? (
              <span className="gold-gradient-text">{customHeading}</span>
            ) : lang === 'ar' ? (
              <>
                لماذا تضع كبرى الشركات <span className="gold-gradient-text">ثقتها المطلقة في مكتبنا؟</span>
              </>
            ) : lang === 'tr' ? (
              <>
                Küresel Şirketler Neden <span className="gold-gradient-text">En Kritik Dosyalarını Bize Emanet Ediyor?</span>
              </>
            ) : (
              <>
                Why Global Corporations <span className="gold-gradient-text">Entrust Us With Their Critical Stakes</span>
              </>
            )}
          </h2>

          <p className="text-[#4b4334] text-base sm:text-lg">
            {subtitleText}
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pillars.map((pillar, idx) => {
            const title = getLocalized(pillar, 'title', lang, pillar.titleAr);
            const desc = getLocalized(pillar, 'desc', lang, pillar.descAr);

            return (
              <div
                key={pillar.id || idx}
                className="rounded-2xl bg-white p-8 border border-[#e6ddcc] hover:border-[#b38a38] transition duration-300 group hover:-translate-y-1 relative shadow-md hover:shadow-xl font-cards-custom"
              >
                {/* Pillar Number */}
                <span className="absolute top-6 right-6 rtl:right-auto rtl:left-6 font-serif-title text-4xl font-extrabold text-[#e6ddcc] group-hover:text-[#b38a38]/30 transition-colors tabular-nums">
                  {idx + 1 < 10 ? `0${idx + 1}` : `${idx + 1}`}
                </span>

                <div className="w-14 h-14 rounded-xl bg-[#b38a38]/15 border border-[#b38a38]/30 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#b38a38]/25 transition duration-300 shadow-sm">
                  {renderPillarIcon(pillar.iconName)}
                </div>

                <h3 className="text-xl font-bold font-serif-title text-[#181512] mb-3 group-hover:text-[#87641d] transition">
                  {title}
                </h3>

                <p className="text-[#4b4334] text-sm leading-relaxed font-normal">
                  {desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
});
