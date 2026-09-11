import React, { useState } from 'react';
import { 
  Users, Mail, Phone, Linkedin, Award, GraduationCap, 
  ArrowLeft, ArrowRight, ShieldCheck, X, Scale, Globe 
} from 'lucide-react';
import { Partner, Language } from '../types';
import { useTranslation, getLocalized } from '../services/i18n';

interface PartnersSectionProps {
  partners: Partner[];
  lang: Language;
  onOpenConsultation: (practiceId?: string, partnerId?: string) => void;
}

const formatLanguages = (langs: string[] | undefined, l: Language) => {
  if (!langs || langs.length === 0) return '';
  const dict: Record<string, { en: string; tr: string; ar: string }> = {
    'العربية': { ar: 'العربية', en: 'Arabic', tr: 'Arapça' },
    'الإنجليزية': { ar: 'الإنجليزية', en: 'English', tr: 'İngilizce' },
    'الفرنسية': { ar: 'الفرنسية', en: 'French', tr: 'Fransızca' },
    'الألمانية': { ar: 'الألمانية', en: 'German', tr: 'Almanca' },
    'التركية': { ar: 'التركية', en: 'Turkish', tr: 'Türkçe' },
    'Türkçe': { ar: 'التركية', en: 'Turkish', tr: 'Türkçe' },
    'English': { ar: 'الإنجليزية', en: 'English', tr: 'İngilizce' },
    'Arabic': { ar: 'العربية', en: 'Arabic', tr: 'Arapça' },
    'French': { ar: 'الفرنسية', en: 'French', tr: 'Fransızca' },
    'German': { ar: 'الألمانية', en: 'German', tr: 'Almanca' },
  };

  return langs
    .map(item => {
      const trimmed = item.trim();
      return dict[trimmed] ? dict[trimmed][l] || trimmed : trimmed;
    })
    .join(' • ');
};

export const PartnersSection: React.FC<PartnersSectionProps> = ({
  partners,
  lang,
  onOpenConsultation
}) => {
  const isRtl = lang === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;
  const t = useTranslation(lang);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'partner' | 'associates'>('all');

  const filteredPartners = partners.filter(p => {
    if (activeFilter === 'partner') return p.isPartner !== false;
    if (activeFilter === 'associates') return p.isPartner === false;
    return true;
  });

  const getRoleBadgeLabel = (partner: Partner) => {
    const isPartner = partner.isPartner !== false;
    const isCounsel = partner.roleCategory === 'counsel' || partner.roleCategory === 'legal_consultant';
    const isTrainee = partner.roleCategory === 'trainee';

    if (lang === 'ar') {
      if (isPartner) return 'شريك';
      if (isCounsel) return 'مستشار';
      if (isTrainee) return 'متدرب';
      return 'محامٍ مشارك';
    } else if (lang === 'tr') {
      if (isPartner) return 'Ortak Avukat';
      if (isCounsel) return 'Hukuk Müşaviri';
      if (isTrainee) return 'Stajyer Avukat';
      return 'Kıdemli Avukat';
    } else {
      if (isPartner) return 'Partner';
      if (isCounsel) return 'Counsel';
      if (isTrainee) return 'Trainee';
      return 'Associate';
    }
  };

  return (
    <section id="partners" className="py-24 bg-[#f7f2e8] relative border-t border-[#e6ddcc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#b38a38]/12 border border-[#b38a38]/30 text-[#87641d] text-xs font-bold uppercase tracking-wider mb-4">
            <Users className="w-3.5 h-3.5" />
            <span>{t.partnersBadge}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif-title font-bold text-[#181512] tracking-tight mb-4">
            {lang === 'ar' ? (
              <>
                نخبة من كبار <span className="gold-gradient-text">الشركاء والمحامين والمحكّمين</span>
              </>
            ) : lang === 'tr' ? (
              <>
                Seçkin <span className="gold-gradient-text">Ortaklarımız, Avukatlarımız ve Hakemlerimiz</span>
              </>
            ) : (
              <>
                Distinguished <span className="gold-gradient-text">Partners & Legal Practitioners</span>
              </>
            )}
          </h2>

          <p className="text-[#4b4334] text-base sm:text-lg mb-8">
            {t.partnersSubtitle}
          </p>

          {/* Filter Tabs */}
          <div className="inline-flex items-center p-1.5 rounded-2xl bg-white border border-[#e6ddcc] shadow-sm gap-1 flex-wrap justify-center">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-gradient-to-r from-[#b38a38] to-[#87641d] text-white shadow-sm'
                  : 'text-[#5c5343] hover:text-[#181512]'
              }`}
            >
              {t.allTeam} ({partners.length})
            </button>

            <button
              onClick={() => setActiveFilter('partner')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeFilter === 'partner'
                  ? 'bg-gradient-to-r from-[#b38a38] to-[#87641d] text-white shadow-sm'
                  : 'text-[#5c5343] hover:text-[#181512]'
              }`}
            >
              👔 {t.partnersLeadership} ({partners.filter(p => p.isPartner !== false).length})
            </button>

            <button
              onClick={() => setActiveFilter('associates')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeFilter === 'associates'
                  ? 'bg-gradient-to-r from-[#b38a38] to-[#87641d] text-white shadow-sm'
                  : 'text-[#5c5343] hover:text-[#181512]'
              }`}
            >
              ⚖️ {t.legalCounsel} ({partners.filter(p => p.isPartner === false).length})
            </button>
          </div>
        </div>

        {/* Partners & Lawyers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {filteredPartners.map(partner => {
            const isPartner = partner.isPartner !== false;
            const isCounsel = partner.roleCategory === 'counsel' || partner.roleCategory === 'legal_consultant';
            const isTrainee = partner.roleCategory === 'trainee';
            const name = getLocalized(partner, 'name', lang, partner.name);
            const title = getLocalized(partner, 'title', lang, partner.title);
            const bio = getLocalized(partner, 'bio', lang, partner.bio);

            return (
              <div
                key={partner.id}
                className="group rounded-2xl bg-white border border-[#e6ddcc] hover:border-[#b38a38] transition-all duration-300 overflow-hidden flex flex-col justify-between hover:-translate-y-2 shadow-md hover:shadow-xl font-cards-custom"
              >
                {/* Portrait Image Container */}
                <div className="relative h-80 overflow-hidden bg-[#f4eee2]">
                  <img
                    src={partner.image}
                    alt={name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#181512]/60 via-transparent to-transparent" />

                  {/* Role Type Pill on Image */}
                  <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3">
                    {isPartner ? (
                      <span className="px-2.5 py-1 rounded-lg bg-[#87641d] text-white text-[10px] font-bold shadow-md border border-white/20 flex items-center gap-1">
                        <span>👔</span>
                        <span>{getRoleBadgeLabel(partner)}</span>
                      </span>
                    ) : isCounsel ? (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-800 text-white text-[10px] font-bold shadow-md border border-white/20 flex items-center gap-1">
                        <span>📜</span>
                        <span>{getRoleBadgeLabel(partner)}</span>
                      </span>
                    ) : isTrainee ? (
                      <span className="px-2.5 py-1 rounded-lg bg-purple-800 text-white text-[10px] font-bold shadow-md border border-white/20 flex items-center gap-1">
                        <span>🎓</span>
                        <span>{getRoleBadgeLabel(partner)}</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg bg-[#181512]/90 text-[#e5cb8e] text-[10px] font-bold shadow-md border border-[#b38a38]/40 flex items-center gap-1">
                        <span>⚖️</span>
                        <span>{getRoleBadgeLabel(partner)}</span>
                      </span>
                    )}
                  </div>

                  {/* Experience Badge */}
                  <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3 px-2.5 py-1 rounded-lg bg-white/95 border border-[#b38a38]/40 text-[#87641d] text-xs font-mono font-bold shadow-sm backdrop-blur-md">
                    +{partner.experienceYears} {t.experienceYearsBadge}
                  </div>

                  {/* Quick Social / Contact Hover Icons */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-2 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-[#e6ddcc] shadow-md">
                    <a
                      href={`mailto:${partner.email}`}
                      className="text-[#4b4334] hover:text-[#87641d] transition p-1"
                      title={partner.email}
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                    <a
                      href={`tel:${partner.phone}`}
                      className="text-[#4b4334] hover:text-[#87641d] transition p-1"
                      title={partner.phone}
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                    <a
                      href={partner.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#4b4334] hover:text-[#87641d] transition p-1"
                      title="LinkedIn"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Partner Card Info */}
                <div className="p-5 flex flex-col flex-grow justify-between">
                  <div>
                    <h3 className="text-lg font-bold font-serif-title text-[#181512] group-hover:text-[#87641d] transition-colors leading-snug">
                      {name}
                    </h3>

                    <p className="text-xs font-bold text-[#87641d] mt-1 mb-2 line-clamp-1">
                      {title}
                    </p>

                    <p className="text-xs text-[#5c5343] line-clamp-2 leading-relaxed mb-4">
                      {bio}
                    </p>
                  </div>

                  {/* Bottom Actions */}
                  <div className="pt-3 border-t border-[#e6ddcc] flex items-center justify-between">
                    <button
                      onClick={() => setSelectedPartner(partner)}
                      className="text-xs font-bold text-[#87641d] hover:text-[#181512] flex items-center gap-1 transition cursor-pointer"
                    >
                      <span>{lang === 'ar' ? 'السيرة والشهادات' : lang === 'tr' ? 'Özgeçmiş ve Yetkinlikler' : 'Full Profile'}</span>
                      <ArrowIcon className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onOpenConsultation(undefined, partner.id)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-[#b38a38]/15 hover:bg-[#b38a38] text-[#87641d] hover:text-white font-bold transition cursor-pointer"
                    >
                      {lang === 'ar' ? 'حجز موعد' : lang === 'tr' ? 'Randevu Al' : 'Book'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Partner Detail Modal */}
      {selectedPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl rounded-2xl bg-[#fbf8f2] border border-[#c5a869]/50 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            
            {/* Close button */}
            <button
              onClick={() => setSelectedPartner(null)}
              className="absolute top-5 left-5 rtl:left-auto rtl:right-5 p-2 rounded-xl bg-white border border-[#d8ceb8] text-[#5c5343] hover:text-[#181512] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Top Partner Header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-6">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-[#b38a38]/50 flex-shrink-0 shadow-md">
                <img
                  src={selectedPartner.image}
                  alt={getLocalized(selectedPartner, 'name', lang, selectedPartner.name)}
                  className="w-full h-full object-cover object-top"
                />
              </div>

              <div className="text-center sm:text-start">
                <div className="inline-flex items-center gap-1.5 text-xs text-[#87641d] font-bold mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{getLocalized(selectedPartner, 'barAdmission', lang, selectedPartner.barAdmission)}</span>
                </div>
                <h3 className="text-2xl font-serif-title font-bold text-[#181512]">
                  {getLocalized(selectedPartner, 'name', lang, selectedPartner.name)}
                </h3>
                <p className="text-sm font-bold text-[#87641d] mt-0.5">
                  {getLocalized(selectedPartner, 'title', lang, selectedPartner.title)}
                </p>
                <p className="text-xs text-[#5c5343] mt-1 font-medium">
                  {getLocalized(selectedPartner, 'specialty', lang, selectedPartner.specialty)}
                </p>
              </div>
            </div>

            {/* Bio */}
            <div className="mb-6">
              <h4 className="text-xs font-bold text-[#87641d] uppercase tracking-wider mb-2">
                {lang === 'ar' ? 'النبذة المهنية والخبرة:' : lang === 'tr' ? 'Mesleki Özgeçmiş ve Uzmanlık:' : 'Professional Biography:'}
              </h4>
              <p className="text-[#4b4334] text-sm leading-relaxed">
                {getLocalized(selectedPartner, 'bio', lang, selectedPartner.bio)}
              </p>
            </div>

            {/* Education & Qualifications */}
            <div className="mb-6">
              <h4 className="text-xs font-bold text-[#87641d] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4" />
                <span>{t.academicCredentials}</span>
              </h4>
              <div className="space-y-2">
                {(lang === 'tr' && selectedPartner.educationTr && selectedPartner.educationTr.length > 0
                  ? selectedPartner.educationTr
                  : lang === 'en' && selectedPartner.educationEn && selectedPartner.educationEn.length > 0
                  ? selectedPartner.educationEn
                  : selectedPartner.education || []
                ).map((edu, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-[#2c261e] p-2.5 rounded-xl bg-white border border-[#e6ddcc]">
                    <Award className="w-3.5 h-3.5 text-[#b38a38] flex-shrink-0 mt-0.5" />
                    <span>{edu}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Languages & Experience */}
            <div className="grid grid-cols-2 gap-4 mb-6 p-4 rounded-xl bg-[#f4eee2] border border-[#e6ddcc]">
              <div>
                <span className="text-xs text-[#5c5343] block mb-1 flex items-center gap-1">
                  <Globe className="w-3 h-3 text-[#87641d]" />
                  {t.languagesBadge}
                </span>
                <span className="text-xs text-[#181512] font-bold">
                  {formatLanguages(selectedPartner.languages, lang)}
                </span>
              </div>

              <div>
                <span className="text-xs text-[#5c5343] block mb-1 flex items-center gap-1">
                  <Award className="w-3 h-3 text-[#87641d]" />
                  {t.casesWonBadge}
                </span>
                <span className="text-xs text-[#87641d] font-bold">
                  +{selectedPartner.casesWonCount || 300} {t.casesHandled}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#e6ddcc]">
              <div className="flex items-center gap-3">
                <a
                  href={`mailto:${selectedPartner.email}`}
                  className="p-2.5 rounded-xl bg-white border border-[#d8ceb8] text-[#5c5343] hover:text-[#181512] transition"
                  title={selectedPartner.email}
                >
                  <Mail className="w-4 h-4" />
                </a>
                <a
                  href={`tel:${selectedPartner.phone}`}
                  className="p-2.5 rounded-xl bg-white border border-[#d8ceb8] text-[#5c5343] hover:text-[#181512] transition"
                  title={selectedPartner.phone}
                >
                  <Phone className="w-4 h-4" />
                </a>
              </div>

              <button
                onClick={() => {
                  const partnerId = selectedPartner.id;
                  setSelectedPartner(null);
                  onOpenConsultation(undefined, partnerId);
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#b38a38] via-[#c5a869] to-[#87641d] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Scale className="w-4 h-4 text-white" />
                <span>{t.bookDirectWithPartner}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
