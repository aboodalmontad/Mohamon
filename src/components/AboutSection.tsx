import React, { useState } from 'react';
import { Shield, Target, Compass, Users, CheckCircle2, Scale, BookOpen } from 'lucide-react';
import { SiteSettings, Language } from '../types';
import { useTranslation, getLocalized } from '../services/i18n';

interface AboutSectionProps {
  settings: SiteSettings;
  lang: Language;
  onOpenConsultation: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ settings, lang, onOpenConsultation }) => {
  const [activeTab, setActiveTab] = useState<'vision' | 'methodology' | 'standards'>('vision');
  const t = useTranslation(lang);

  const aboutText = getLocalized(settings, 'aboutText', lang, settings.aboutTextAr);
  const aboutHeading = getLocalized(settings, 'aboutHeading', lang, settings.aboutHeadingAr || (
    lang === 'ar' 
      ? 'أكثر من ربع قرن في حماية الاستثمارات وصناعة القرارات القانونية الفارقة' 
      : lang === 'tr' 
      ? 'Çeyrek asrı aşkın süredir Yatırımları Koruyor ve Stratejik Hukuki Zaferlere İmza Atıyoruz' 
      : 'Over a Quarter Century of Protecting Capital & Shaping High-Stakes Law'
  ));
  const aboutBadge = getLocalized(settings, 'aboutBadge', lang, settings.aboutBadgeAr || t.aboutBadge);
  const aboutVision = getLocalized(settings, 'aboutVision', lang, settings.aboutVisionAr || '');
  const aboutMethodology = getLocalized(settings, 'aboutMethodology', lang, settings.aboutMethodologyAr || '');
  const aboutConfidentiality = getLocalized(settings, 'aboutConfidentiality', lang, settings.aboutConfidentialityAr || '');

  // Dynamic Bullet points
  const visionP1 = getLocalized(settings, 'aboutVisionPoint1', lang, settings.aboutVisionPoint1Ar || (lang === 'ar' ? 'حماية استباقية للأصول والمصالح' : lang === 'tr' ? 'Varlık ve Hakların Proaktif Korunması' : 'Proactive asset shielding'));
  const visionP2 = getLocalized(settings, 'aboutVisionPoint2', lang, settings.aboutVisionPoint2Ar || (lang === 'ar' ? 'تمثيل قضائي وتحكيمي لا مثيل له' : lang === 'tr' ? 'Kusursuz Tahkim ve Dava Temsili' : 'Unmatched arbitral representation'));

  const methodP1 = getLocalized(settings, 'aboutMethodologyPoint1', lang, settings.aboutMethodologyPoint1Ar || (lang === 'ar' ? 'تدقيق قانوني نافي للجهالة متكامل' : lang === 'tr' ? 'Kapsamlı Hukuki Durum Tespiti (Due Diligence)' : 'Comprehensive due diligence'));
  const methodP2 = getLocalized(settings, 'aboutMethodologyPoint2', lang, settings.aboutMethodologyPoint2Ar || (lang === 'ar' ? 'صياغة عقود محصنة من النزاعات' : lang === 'tr' ? 'Uyuşmazlıklara Karşı Korumalı Sözleşmeler' : 'Dispute-proof contractual drafting'));

  const confP1 = getLocalized(settings, 'aboutConfidentialityPoint1', lang, settings.aboutConfidentialityPoint1Ar || (lang === 'ar' ? 'اتفاقيات عدم إفصاح مغلظة' : lang === 'tr' ? 'Katı Gizlilik ve Gizli Kalma Protokolleri' : 'Stringent NDA protocols'));
  const confP2 = getLocalized(settings, 'aboutConfidentialityPoint2', lang, settings.aboutConfidentialityPoint2Ar || (lang === 'ar' ? 'قنوات اتصال مشفرة مع الموكلين' : lang === 'tr' ? 'Müvekkillerle Uçtan Uca Şifreli İletişim' : 'Encrypted client communications'));

  const rankingTitle = getLocalized(settings, 'aboutRankingTitle', lang, settings.aboutRankingTitleAr || t.aboutRankingTitle);
  const rankingDesc = getLocalized(settings, 'aboutRankingDesc', lang, settings.aboutRankingDescAr || t.aboutRankingDesc);
  const ctaText = getLocalized(settings, 'aboutCtaText', lang, settings.aboutCtaTextAr || t.aboutBookMeeting);
  const sectionImage = settings.aboutImageUrl || "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000";

  return (
    <section id="about" className="py-24 bg-[#f7f2e8] relative overflow-hidden border-t border-[#e6ddcc]">
      {/* Ambient background blur */}
      <div className="absolute top-1/3 -left-48 w-96 h-96 bg-[#b38a38]/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-48 w-96 h-96 bg-[#c5a869]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Visual Storytelling & Imagery */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-[#c5a869]/40 group">
              <img
                src={sectionImage}
                alt="Law Firm Executive Boardroom"
                className="w-full h-[480px] object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#181512]/60 via-transparent to-transparent opacity-80" />

              {/* Floating Award Card */}
              <div className="absolute bottom-6 left-6 right-6 p-5 rounded-2xl bg-white/95 border border-[#c5a869]/40 shadow-xl backdrop-blur-md">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#b38a38]/15 flex items-center justify-center border border-[#b38a38]/40 flex-shrink-0">
                    <Scale className="w-6 h-6 text-[#87641d]" />
                  </div>
                  <div>
                    <h4 className="text-[#181512] font-bold text-sm">
                      {rankingTitle}
                    </h4>
                    <p className="text-xs text-[#87641d] font-semibold">
                      {rankingDesc}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Experience badge float */}
            <div className="absolute -top-6 -right-4 sm:-right-6 bg-gradient-to-br from-[#b38a38] to-[#87641d] text-white p-4 rounded-2xl shadow-xl font-bold flex flex-col items-center">
              <span className="text-2xl font-serif-title leading-none">+{settings.stats?.yearsExperience || 28}</span>
              <span className="text-[11px] font-semibold uppercase tracking-wider">{t.statsYears}</span>
            </div>
          </div>

          {/* Right Column: Narrative & Values */}
          <div className="lg:col-span-7">
            {/* Section Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#b38a38]/12 border border-[#b38a38]/30 text-[#87641d] text-xs font-bold uppercase tracking-wider mb-4">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{aboutBadge}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif-title font-bold text-[#181512] tracking-tight mb-6 leading-tight">
              {aboutHeading}
            </h2>

            <p className="text-[#4b4334] text-base sm:text-lg leading-relaxed mb-8 font-normal whitespace-pre-line">
              {aboutText}
            </p>

            {/* Interactive Tabs for About us */}
            <div className="mb-6 border-b border-[#e6ddcc] flex gap-4 overflow-x-auto pb-1">
              <button
                onClick={() => setActiveTab('vision')}
                className={`pb-3 text-sm font-bold transition border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeTab === 'vision'
                    ? 'border-[#b38a38] text-[#87641d]'
                    : 'border-transparent text-[#6b6255] hover:text-[#181512]'
                }`}
              >
                <Target className="w-4 h-4" />
                <span>{t.aboutTabVision}</span>
              </button>

              <button
                onClick={() => setActiveTab('methodology')}
                className={`pb-3 text-sm font-bold transition border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeTab === 'methodology'
                    ? 'border-[#b38a38] text-[#87641d]'
                    : 'border-transparent text-[#6b6255] hover:text-[#181512]'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>{t.aboutTabMethodology}</span>
              </button>

              <button
                onClick={() => setActiveTab('standards')}
                className={`pb-3 text-sm font-bold transition border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeTab === 'standards'
                    ? 'border-[#b38a38] text-[#87641d]'
                    : 'border-transparent text-[#6b6255] hover:text-[#181512]'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>{t.aboutTabStandards}</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="min-h-[140px] text-[#4b4334] text-sm leading-relaxed mb-8">
              {activeTab === 'vision' && (
                <div className="space-y-3">
                  <p className="whitespace-pre-line">{aboutVision}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                    <div className="flex items-center gap-2 text-[#2c261e] font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-[#b38a38] flex-shrink-0" />
                      <span>{visionP1}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#2c261e] font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-[#b38a38] flex-shrink-0" />
                      <span>{visionP2}</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'methodology' && (
                <div className="space-y-3">
                  <p className="whitespace-pre-line">{aboutMethodology}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                    <div className="flex items-center gap-2 text-[#2c261e] font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-[#b38a38] flex-shrink-0" />
                      <span>{methodP1}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#2c261e] font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-[#b38a38] flex-shrink-0" />
                      <span>{methodP2}</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'standards' && (
                <div className="space-y-3">
                  <p className="whitespace-pre-line">{aboutConfidentiality}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                    <div className="flex items-center gap-2 text-[#2c261e] font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-[#b38a38] flex-shrink-0" />
                      <span>{confP1}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#2c261e] font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-[#b38a38] flex-shrink-0" />
                      <span>{confP2}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Call to action */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={onOpenConsultation}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#b38a38] via-[#c5a869] to-[#87641d] text-white font-bold text-sm hover:brightness-105 transition shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Users className="w-4 h-4" />
                <span>{ctaText}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
