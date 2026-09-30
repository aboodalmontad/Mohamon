import React, { useState } from 'react';
import { 
  Users, Mail, Phone, Linkedin, Award, GraduationCap, 
  ArrowLeft, ArrowRight, ShieldCheck, X, Scale, Globe, Crown, Briefcase 
} from 'lucide-react';
import { Partner, Language } from '../types';
import { useTranslation, getLocalized, getLocalizedArray } from '../services/i18n';
import { translateTextSync } from '../services/translator';

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
    'الانكليزية': { ar: 'الإنجليزية', en: 'English', tr: 'İngilizce' },
    'الإنكليزية': { ar: 'الإنجليزية', en: 'English', tr: 'İngilizce' },
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
      if (dict[trimmed]) return dict[trimmed][l] || trimmed;
      return l === 'ar' ? trimmed : translateTextSync(trimmed, l);
    })
    .join(' • ');
};

export const PartnersSection: React.FC<PartnersSectionProps> = React.memo(({
  partners,
  lang,
  onOpenConsultation
}) => {
  const isRtl = lang === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;
  const t = useTranslation(lang);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'partner' | 'associates'>('all');

  const foundingPartners = React.useMemo(
    () => partners.filter(p => p.isPartner !== false),
    [partners]
  );

  const nonPartnerLawyers = React.useMemo(
    () => partners.filter(p => p.isPartner === false),
    [partners]
  );

  const showFoundingPartners = activeFilter === 'all' || activeFilter === 'partner';
  const showNonPartners = activeFilter === 'all' || activeFilter === 'associates';

  const getRoleBadgeLabel = (partner: Partner) => {
    const isPartner = partner.isPartner !== false;
    const isCounsel = partner.roleCategory === 'counsel' || partner.roleCategory === 'legal_consultant';
    const isTrainee = partner.roleCategory === 'trainee';

    if (lang === 'ar') {
      if (isPartner) return 'شريك مؤسس';
      if (isCounsel) return 'مستشار (غير شريك)';
      if (isTrainee) return 'محامٍ متدرب (غير شريك)';
      return 'محامٍ مشارك (غير شريك)';
    } else if (lang === 'tr') {
      if (isPartner) return 'Kurucu Ortak';
      if (isCounsel) return 'Hukuk Müşaviri (Ortak Değil)';
      if (isTrainee) return 'Stajyer Avukat (Ortak Değil)';
      return 'Avukat (Ortak Değil)';
    } else {
      if (isPartner) return 'Founding Partner';
      if (isCounsel) return 'Legal Counsel (Non-Partner)';
      if (isTrainee) return 'Trainee Lawyer (Non-Partner)';
      return 'Associate Attorney (Non-Partner)';
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
              👑 {t.partnersLeadership} ({foundingPartners.length})
            </button>

            {nonPartnerLawyers.length > 0 && (
              <button
                onClick={() => setActiveFilter('associates')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeFilter === 'associates'
                    ? 'bg-gradient-to-r from-[#b38a38] to-[#87641d] text-white shadow-sm'
                    : 'text-[#5c5343] hover:text-[#181512]'
                }`}
              >
                ⚖️ {lang === 'ar' ? 'المحامون والمستشارون (غير الشركاء)' : lang === 'tr' ? 'Avukatlar (Ortak Olmayan)' : 'Associates & Counsel (Non-Partners)'} ({nonPartnerLawyers.length})
              </button>
            )}
          </div>
        </div>

        {/* ===================================================================== */}
        {/* TIER 1: FOUNDING & MANAGING PARTNERS (Larger Portraits & Gold Frame) */}
        {/* ===================================================================== */}
        {showFoundingPartners && foundingPartners.length > 0 && (
          <div className="mb-16">
            {/* Tier 1 Prominent Header */}
            <div className="flex items-center justify-between flex-wrap gap-3 mb-8 pb-4 border-b-2 border-[#b38a38]/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#b38a38] to-[#87641d] text-white flex items-center justify-center shadow-md">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-serif-title font-bold text-[#181512]">
                    {lang === 'ar' ? 'الشركاء المؤسسون والقيادة التنفيذية' : lang === 'tr' ? 'Kurucu Ortaklar ve İcra Liderliği' : 'Founding & Managing Partners'}
                  </h3>
                  <p className="text-xs text-[#6b6255]">
                    {lang === 'ar'
                      ? 'أصحاب المكتب والشركاء المشرفون على كافة القضايا والاستشارات الاستراتيجية'
                      : lang === 'tr'
                      ? 'Tüm stratejik dava ve danışmanlık süreçlerini yöneten kurucu ortaklarımız'
                      : 'Principal partners leading all strategic litigation, arbitration, and corporate mandates'}
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#b38a38]/20 to-[#87641d]/15 text-[#87641d] border border-[#b38a38]/40 flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-[#b38a38]" />
                <span>{lang === 'ar' ? 'هيئة الشركاء المؤسسين' : lang === 'tr' ? 'Kurucu Ortaklar Kurulu' : 'Executive Partnership Board'}</span>
              </span>
            </div>

            {/* Founding Partners Grid — Larger Cards & Tall Executive Portraits */}
            <div
              className={`grid gap-8 lg:gap-10 ${
                foundingPartners.length === 1
                  ? 'grid-cols-1 max-w-xl mx-auto'
                  : foundingPartners.length === 2
                  ? 'grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto'
                  : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              }`}
            >
              {foundingPartners.map(partner => {
                const name = getLocalized(partner, 'name', lang, partner.name);
                const title = getLocalized(partner, 'title', lang, partner.title);
                const specialty = getLocalized(partner, 'specialty', lang, partner.specialty);
                const barAdmission = getLocalized(partner, 'barAdmission', lang, partner.barAdmission);
                const bio = getLocalized(partner, 'bio', lang, partner.bio);
                const educationList = getLocalizedArray(partner, 'education', lang, partner.education || []);

                return (
                  <div
                    key={partner.id}
                    className="group relative rounded-3xl bg-white border-2 border-[#b38a38]/70 ring-4 ring-[#b38a38]/10 hover:border-[#87641d] transition-all duration-300 overflow-hidden flex flex-col justify-between hover:-translate-y-2 shadow-xl hover:shadow-2xl font-cards-custom"
                  >
                    {/* Top Executive Gold Ribbon */}
                    <div className="h-2 w-full bg-gradient-to-r from-[#87641d] via-[#e5cb8e] to-[#87641d]" />

                    {/* Large Portrait Image Container for Founding Partner */}
                    <div className="relative h-96 sm:h-[430px] overflow-hidden bg-[#f4eee2]">
                      <img
                        src={partner.image}
                        alt={name}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#181512]/75 via-[#181512]/10 to-transparent" />

                      {/* Prominent Founding Partner Badge */}
                      <div className="absolute top-4 left-4 rtl:left-auto rtl:right-4">
                        <span className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#87641d] via-[#b38a38] to-[#87641d] text-white text-xs font-bold shadow-lg border border-[#e5cb8e]/60 flex items-center gap-1.5">
                          <Crown className="w-3.5 h-3.5 text-[#fff4d6]" />
                          <span>{getRoleBadgeLabel(partner)}</span>
                        </span>
                      </div>

                      {/* Experience Badge */}
                      <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4 px-3 py-1.5 rounded-xl bg-[#181512]/90 border border-[#c5a869]/60 text-[#e5cb8e] text-xs font-mono font-bold shadow-md backdrop-blur-md">
                        +{partner.experienceYears} {t.experienceYearsBadge}
                      </div>

                      {/* Quick Social / Contact Hover Icons */}
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-3 py-2 rounded-xl bg-white/95 backdrop-blur-md border border-[#b38a38]/40 shadow-lg">
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

                    {/* Founding Partner Card Info */}
                    <div className="p-6 sm:p-7 flex flex-col flex-grow justify-between space-y-4 bg-gradient-to-b from-white to-[#fbf8f2]">
                      <div className="space-y-2.5">
                        {/* Bar Admission / License Badge */}
                        {barAdmission && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#b38a38]/15 border border-[#b38a38]/40 text-xs font-bold text-[#87641d]">
                            <ShieldCheck className="w-4 h-4 flex-shrink-0 text-[#b38a38]" />
                            <span>{barAdmission}</span>
                          </div>
                        )}

                        <h3 className="text-xl sm:text-2xl font-bold font-serif-title text-[#181512] group-hover:text-[#87641d] transition-colors leading-snug">
                          {name}
                        </h3>

                        <p className="text-sm font-bold text-[#87641d]">
                          {title}
                        </p>

                        {/* Primary Specialty */}
                        {specialty && (
                          <div className="flex items-start gap-2 text-xs font-semibold text-[#2c261e] bg-[#f7f2e8] px-3 py-2 rounded-xl border border-[#b38a38]/30">
                            <Scale className="w-4 h-4 text-[#87641d] flex-shrink-0 mt-0.5" />
                            <span>{specialty}</span>
                          </div>
                        )}

                        {/* Education & Professional Accreditations */}
                        {educationList.length > 0 && (
                          <div className="pt-1 space-y-1.5">
                            <span className="text-xs font-bold text-[#87641d] flex items-center gap-1.5">
                              <GraduationCap className="w-4 h-4" />
                              <span>{t.academicCredentials}</span>
                            </span>
                            <div className="space-y-1.5">
                              {educationList.map((edu, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-start gap-2 text-xs font-medium text-[#2c261e] bg-white px-3 py-2 rounded-xl border border-[#e6ddcc] shadow-2xs"
                                >
                                  <Award className="w-4 h-4 text-[#b38a38] flex-shrink-0 mt-0.5" />
                                  <span>{edu}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <p className="text-xs sm:text-sm text-[#5c5343] line-clamp-3 leading-relaxed pt-1 whitespace-pre-line">
                          {bio}
                        </p>
                      </div>

                      {/* Stats & Bottom Actions */}
                      <div className="space-y-3 pt-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#5c5343] bg-[#f4eee2] px-3.5 py-2 rounded-xl border border-[#e6ddcc]">
                          {partner.languages && partner.languages.length > 0 && (
                            <span className="flex items-center gap-1.5 font-medium">
                              <Globe className="w-3.5 h-3.5 text-[#87641d]" />
                              <span>{formatLanguages(partner.languages, lang)}</span>
                            </span>
                          )}
                          {partner.casesWonCount !== undefined && (
                            <span className="font-bold text-[#87641d]">
                              +{partner.casesWonCount} {t.casesHandled}
                            </span>
                          )}
                        </div>

                        <div className="pt-3 border-t border-[#e6ddcc] flex items-center justify-between gap-2">
                          <button
                            onClick={() => setSelectedPartner(partner)}
                            className="text-xs sm:text-sm font-bold text-[#87641d] hover:text-[#181512] flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <span>{lang === 'ar' ? 'السيرة والشهادات الكاملة' : lang === 'tr' ? 'Özgeçmiş ve Yetkinlikler' : 'Full Executive Profile'}</span>
                            <ArrowIcon className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onOpenConsultation(undefined, partner.id)}
                            className="text-xs px-4 py-2 rounded-xl bg-gradient-to-r from-[#b38a38] to-[#87641d] hover:brightness-110 text-white font-bold shadow-md transition cursor-pointer"
                          >
                            {lang === 'ar' ? 'حجز موعد مع الشريك' : lang === 'tr' ? 'Ortakla Randevu' : 'Book with Partner'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* TIER 2: NON-PARTNER LAWYERS & ASSOCIATES (Smaller Photos & Secondary) */}
        {/* ===================================================================== */}
        {showNonPartners && nonPartnerLawyers.length > 0 && (
          <div className="mt-8 rounded-3xl bg-[#efe9dc]/75 border border-[#dfd5c0] p-6 sm:p-8">
            {/* Secondary Section Header Clearly Marking Non-Partner Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#dcd2be]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-stone-200 border border-stone-300 text-stone-700 flex items-center justify-center">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-serif-title font-bold text-stone-800">
                    {lang === 'ar'
                      ? 'فريق المحامين والمستشارين القانونيين (غير الشركاء)'
                      : lang === 'tr'
                      ? 'Avukatlar ve Hukuk Müşavirleri Kadrosu (Ortak Olmayan Avukatlar)'
                      : 'Associate Attorneys & Legal Counsel (Non-Partner Staff)'}
                  </h3>
                  <p className="text-xs text-stone-600">
                    {lang === 'ar'
                      ? 'كادر المحامين المشاركين والمستشارين المتخصصين العاملين تحت إشراف الشركاء المؤسسين'
                      : lang === 'tr'
                      ? 'Kurucu ortakların gözetimi ve denetimi altında görev yapan uzman avukat ve danışman kadromuz'
                      : 'Associate lawyers, legal consultants, and trainees practicing under the supervision of the Founding Partners'}
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-semibold px-3 py-1 rounded-lg bg-stone-200/90 text-stone-700 border border-stone-300 w-fit">
                {lang === 'ar' ? 'محامون غير شركاء' : lang === 'tr' ? 'Ortak Olmayan Kadro' : 'Non-Partner Legal Team'} ({nonPartnerLawyers.length})
              </span>
            </div>

            {/* Non-Partner Lawyers Compact 4-Column Grid with Smaller Photos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {nonPartnerLawyers.map(partner => {
                const isCounsel = partner.roleCategory === 'counsel' || partner.roleCategory === 'legal_consultant';
                const isTrainee = partner.roleCategory === 'trainee';
                const name = getLocalized(partner, 'name', lang, partner.name);
                const title = getLocalized(partner, 'title', lang, partner.title);
                const specialty = getLocalized(partner, 'specialty', lang, partner.specialty);
                const barAdmission = getLocalized(partner, 'barAdmission', lang, partner.barAdmission);
                const bio = getLocalized(partner, 'bio', lang, partner.bio);
                const educationList = getLocalizedArray(partner, 'education', lang, partner.education || []);

                return (
                  <div
                    key={partner.id}
                    className="group rounded-2xl bg-[#fbf8f2] border border-[#dcd2be] hover:border-stone-400 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md font-cards-custom"
                  >
                    {/* Smaller Portrait Image Container for Non-Partner (h-52 sm:h-56 vs h-96 sm:h-[430px]) */}
                    <div className="relative h-52 sm:h-56 overflow-hidden bg-stone-200">
                      <img
                        src={partner.image}
                        alt={name}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent" />

                      {/* Non-Partner Role Pill on Image */}
                      <div className="absolute top-2.5 left-2.5 rtl:left-auto rtl:right-2.5">
                        <span
                          className={`px-2 py-0.5 rounded-md text-white text-[10px] font-semibold shadow-xs border border-white/15 flex items-center gap-1 ${
                            isCounsel
                              ? 'bg-emerald-800/90'
                              : isTrainee
                              ? 'bg-purple-800/90'
                              : 'bg-stone-800/90'
                          }`}
                        >
                          <span>{getRoleBadgeLabel(partner)}</span>
                        </span>
                      </div>

                      {/* Experience Badge */}
                      <div className="absolute top-2.5 right-2.5 rtl:right-auto rtl:left-2.5 px-2 py-0.5 rounded-md bg-white/90 border border-stone-300 text-stone-700 text-[10px] font-mono font-bold shadow-2xs">
                        +{partner.experienceYears} {t.experienceYearsBadge}
                      </div>
                    </div>

                    {/* Compact Non-Partner Card Info */}
                    <div className="p-4 flex flex-col flex-grow justify-between space-y-2.5">
                      <div className="space-y-1.5">
                        {barAdmission && (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-stone-200/70 border border-stone-300 text-[10px] font-medium text-stone-700">
                            <ShieldCheck className="w-3 h-3 flex-shrink-0 text-stone-600" />
                            <span className="truncate">{barAdmission}</span>
                          </div>
                        )}

                        <h4 className="text-base font-bold font-serif-title text-stone-900 group-hover:text-[#87641d] transition-colors leading-snug">
                          {name}
                        </h4>

                        <p className="text-[11px] font-semibold text-stone-600">
                          {title}
                        </p>

                        {specialty && (
                          <div className="flex items-start gap-1.5 text-[11px] text-stone-700 bg-white px-2 py-1 rounded-lg border border-stone-200">
                            <Scale className="w-3 h-3 text-stone-500 flex-shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{specialty}</span>
                          </div>
                        )}

                        {educationList.length > 0 && (
                          <div className="text-[10px] text-stone-600 bg-white/80 px-2 py-1 rounded border border-stone-200 line-clamp-1">
                            🎓 {educationList[0]}
                          </div>
                        )}

                        <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed pt-0.5">
                          {bio}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
                        <button
                          onClick={() => setSelectedPartner(partner)}
                          className="text-[11px] font-semibold text-stone-700 hover:text-[#87641d] flex items-center gap-1 transition cursor-pointer"
                        >
                          <span>{lang === 'ar' ? 'عرض الملف' : lang === 'tr' ? 'Profili Gör' : 'View Bio'}</span>
                          <ArrowIcon className="w-3 h-3" />
                        </button>

                        <button
                          onClick={() => onOpenConsultation(undefined, partner.id)}
                          className="text-[11px] px-2.5 py-1 rounded-md bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold transition cursor-pointer"
                        >
                          {lang === 'ar' ? 'استشارة' : lang === 'tr' ? 'Danış' : 'Consult'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Partner Detail Modal */}
      {selectedPartner && (() => {
        const activePartner = partners.find(p => p.id === selectedPartner.id) || selectedPartner;
        const isModalPartner = activePartner.isPartner !== false;
        const modalEduList = getLocalizedArray(activePartner, 'education', lang, activePartner.education || []);

        return (
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
                <div
                  className={`${
                    isModalPartner
                      ? 'w-32 h-36 sm:w-36 sm:h-44 border-2 border-[#b38a38] ring-4 ring-[#b38a38]/15 shadow-lg'
                      : 'w-24 h-24 sm:w-28 sm:h-28 border border-stone-300 shadow-sm'
                  } rounded-2xl overflow-hidden flex-shrink-0`}
                >
                  <img
                    src={activePartner.image}
                    alt={getLocalized(activePartner, 'name', lang, activePartner.name)}
                    className="w-full h-full object-cover object-top"
                    loading="lazy"
                  />
                </div>

                <div className="text-center sm:text-start">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg flex items-center gap-1 ${
                        isModalPartner
                          ? 'bg-gradient-to-r from-[#87641d] to-[#b38a38] text-white'
                          : 'bg-stone-200 text-stone-700 border border-stone-300'
                      }`}
                    >
                      {isModalPartner && <Crown className="w-3 h-3" />}
                      <span>{getRoleBadgeLabel(activePartner)}</span>
                    </span>

                    {activePartner.barAdmission && (
                      <div className="inline-flex items-center gap-1 text-xs text-[#87641d] font-bold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{getLocalized(activePartner, 'barAdmission', lang, activePartner.barAdmission)}</span>
                      </div>
                    )}
                  </div>

                  <h3 className="text-2xl font-serif-title font-bold text-[#181512]">
                    {getLocalized(activePartner, 'name', lang, activePartner.name)}
                  </h3>
                  <p className="text-sm font-bold text-[#87641d] mt-0.5">
                    {getLocalized(activePartner, 'title', lang, activePartner.title)}
                  </p>
                  <p className="text-xs text-[#5c5343] mt-1 font-medium">
                    {getLocalized(activePartner, 'specialty', lang, activePartner.specialty)}
                  </p>
                </div>
              </div>

              {/* Bio */}
              <div className="mb-6">
                <h4 className="text-xs font-bold text-[#87641d] uppercase tracking-wider mb-2">
                  {lang === 'ar' ? 'النبذة المهنية والخبرة:' : lang === 'tr' ? 'Mesleki Özgeçmiş ve Uzmanlık:' : 'Professional Biography:'}
                </h4>
                <p className="text-[#4b4334] text-sm leading-relaxed whitespace-pre-line">
                  {getLocalized(activePartner, 'bio', lang, activePartner.bio)}
                </p>
              </div>

              {/* Education & Qualifications */}
              <div className="mb-6">
                <h4 className="text-xs font-bold text-[#87641d] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4" />
                  <span>{t.academicCredentials}</span>
                </h4>
                <div className="space-y-2">
                  {modalEduList.map((edu, idx) => (
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
                    {formatLanguages(activePartner.languages, lang)}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-[#5c5343] block mb-1 flex items-center gap-1">
                    <Award className="w-3 h-3 text-[#87641d]" />
                    {t.casesWonBadge}
                  </span>
                  <span className="text-xs text-[#87641d] font-bold">
                    +{activePartner.casesWonCount || 300} {t.casesHandled}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#e6ddcc]">
                <div className="flex items-center gap-3">
                  <a
                    href={`mailto:${activePartner.email}`}
                    className="p-2.5 rounded-xl bg-white border border-[#d8ceb8] text-[#5c5343] hover:text-[#181512] transition"
                    title={activePartner.email}
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                  <a
                    href={`tel:${activePartner.phone}`}
                    className="p-2.5 rounded-xl bg-white border border-[#d8ceb8] text-[#5c5343] hover:text-[#181512] transition"
                    title={activePartner.phone}
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                </div>

                <button
                  onClick={() => {
                    const partnerId = activePartner.id;
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
        );
      })()}
    </section>
  );
});
