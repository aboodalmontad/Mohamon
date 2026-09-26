import { 
  Partner, PracticeArea, Testimonial, BlogPost, CaseStudy, SiteSettings, OfficeLocation 
} from '../types';
import { storageService } from './storageService';

// Legal domain dictionary for instant offline high-precision translation
const LEGAL_GLOSSARY: Record<string, { en: string; tr: string }> = {
  // Roles
  'شريك مؤسس ومدير تنفيذي': { en: 'Founding Partner & Managing Director', tr: 'Kurucu Ortak ve Yönetici Direktör' },
  'شريك رئيسي ورئيس قسم التحكيم والنزاعات': { en: 'Senior Partner & Head of Arbitration and Disputes', tr: 'Kıdemli Ortak ve Tahkim ve Uyuşmazlıklar Bölüm Başkanı' },
  'شريك ورئيس قسم الشركات والاستحواذ': { en: 'Partner & Head of Corporate and M&A', tr: 'Ortak ve Şirketler Hukuku ve M&A Başkanı' },
  'شريك - قسم الملكية الفكرية والذكاء الاصطناعي': { en: 'Partner - Intellectual Property & AI Law', tr: 'Ortak - Fikri Mülkiyet ve Yapay Zekâ Hukuku' },
  'محامٍ مشارك أول - قسم التقاضي والعقود': { en: 'Senior Associate Attorney - Litigation & Commercial Contracts', tr: 'Kıdemli Avukat - Dava ve Ticari Sözleşmeler' },
  'مستشار قانوني أول': { en: 'Senior Legal Counsel & Regulatory Advisor', tr: 'Kıdemli Hukuk Müşaviri ve Regülasyon Danışmanı' },
  'محامٍ ممارس': { en: 'Practicing Attorney', tr: 'Ruhsatlı Avukat' },
  'مستشار قانوني': { en: 'Legal Consultant', tr: 'Hukuk Danışmanı' },
  
  // Specialties
  'التحكيم الدولي والنزاعات التجارية الكبرى': { en: 'International Arbitration & High-Stakes Commercial Disputes', tr: 'Uluslararası Tahkim ve Yüksek Meblağlı Ticari Davalar' },
  'الاندماج والاستحواذ وهيكلة الاستثمارات الأجنبية': { en: 'M&A and Cross-Border Foreign Investment Structuring', tr: 'Birleşme ve Devralmalar (M&A) ve Uluslararası Yatırım Yapılandırma' },
  'التمويل المصرفي والأسواق المالية وأدوات الدين': { en: 'Banking & Project Finance, Capital Markets & Sukuk', tr: 'Banka ve Proje Finansmanı, Sermaye Piyasaları ve Tahvil' },
  'الملكية الفكرية وبراءات الاختراع وتشريعات التقنية': { en: 'Intellectual Property, Patents & Emerging Tech Law', tr: 'Fikri Mülkiyet, Patentler ve Yeni Nesil Teknoloji Hukuku' },
  'التقاضي التجاري والعمالي وصياغة المذكرات': { en: 'Commercial Litigation & Contract Drafting', tr: 'Ticari ve İş Davaları Temsili ve Sözleşme Tanzimi' },
  'الاستشارات التنظيمية والتحكيم والامتثال': { en: 'Regulatory Compliance & International Arbitration', tr: 'Regülasyon Uyumu ve Uluslararası Tahkim Danışmanlığı' },
  
  // Bar admissions
  'الهيئة السعودية للمحامين (رخصة محامٍ ممارس)': { en: 'Saudi Bar Association (Licensed Practicing Attorney)', tr: 'Suudi Arabistan Barolar Birliği (Ruhsatlı Avukat)' },
  'ترخيص استشارات قانونية / تحكيم': { en: 'Legal Consultancy & Commercial Arbitration License', tr: 'Hukuki Danışmanlık ve Ticari Tahkim Lisansı' },

  // Cities & Countries
  'الرياض': { en: 'Riyadh', tr: 'Riyad' },
  'جدة': { en: 'Jeddah', tr: 'Cidde' },
  'الدمام': { en: 'Dammam', tr: 'Dammam' },
  'الجزائر': { en: 'Algeria', tr: 'Cezayir' },
  'الجزائر العاصمة': { en: 'Algiers', tr: 'Cezayir' },
  'وهران': { en: 'Oran', tr: 'Oran' },
  'قسنطينة': { en: 'Constantine', tr: 'Konstantin' },
  'القاهرة': { en: 'Cairo', tr: 'Kahire' },
  'الإسكندرية': { en: 'Alexandria', tr: 'İskenderiye' },
  'دبي': { en: 'Dubai', tr: 'Dubai' },
  'أبوظبي': { en: 'Abu Dhabi', tr: 'Abu Dabi' },
  'الدوحة': { en: 'Doha', tr: 'Doha' },
  'الكويت': { en: 'Kuwait', tr: 'Kuveyt' },
  'مدينة الكويت': { en: 'Kuwait City', tr: 'Kuveyt Şehri' },
  'المنامة': { en: 'Manama', tr: 'Manama' },
  'مسقط': { en: 'Muscat', tr: 'Maskat' },
  'عمان': { en: 'Amman', tr: 'Amman' },
  'بيروت': { en: 'Beirut', tr: 'Beyrut' },
  'بغداد': { en: 'Baghdad', tr: 'Bağdat' },
  'دمشق': { en: 'Damascus', tr: 'Şam' },
  'الدار البيضاء': { en: 'Casablanca', tr: 'Kazablanka' },
  'الرباط': { en: 'Rabat', tr: 'Rabat' },
  'مراكش': { en: 'Marrakech', tr: 'Marakeş' },
  'تونس': { en: 'Tunis', tr: 'Tunus' },
  'طرابلس': { en: 'Tripoli', tr: 'Trablus' },
  'إسطنبول': { en: 'Istanbul', tr: 'İstanbul' },
  'أنقرة': { en: 'Ankara', tr: 'Ankara' },
  'لندن': { en: 'London', tr: 'Londra' },
  'باريس': { en: 'Paris', tr: 'Paris' },
  'نيويورك': { en: 'New York', tr: 'New York' },
  'المملكة العربية السعودية': { en: 'Kingdom of Saudi Arabia', tr: 'Suudi Arabistan Krallığı' },
  'السعودية': { en: 'Saudi Arabia', tr: 'Suudi Arabistan' },
  'الجمهورية الجزائرية الديمقراطية الشعبية': { en: "People's Democratic Republic of Algeria", tr: 'Cezayir Demokratik Halk Cumhuriyeti' },
  'الجمهورية الجزائرية': { en: 'Algeria', tr: 'Cezayir' },
  'الإمارات العربية المتحدة': { en: 'United Arab Emirates', tr: 'Birleşik Arap Emirlikleri' },
  'الإمارات': { en: 'UAE', tr: 'BAE' },
  'جمهورية مصر العربية': { en: 'Arab Republic of Egypt', tr: 'Mısır Arap Cumhuriyeti' },
  'مصر': { en: 'Egypt', tr: 'Mısır' },
  'المملكة المغربية': { en: 'Kingdom of Morocco', tr: 'Fas Krallığı' },
  'المغرب': { en: 'Morocco', tr: 'Fas' },
  'الجمهورية التونسية': { en: 'Republic of Tunisia', tr: 'Tunus Cumhuriyeti' },
  'دولة الكويت': { en: 'State of Kuwait', tr: 'Kuveyt Devleti' },
  'دولة قطر': { en: 'State of Qatar', tr: 'Katar Devleti' },
  'قطر': { en: 'Qatar', tr: 'Katar' },
  'سلطنة عمان': { en: 'Sultanate of Oman', tr: 'Umman Sultanlığı' },
  'عمان (سلطنة)': { en: 'Oman', tr: 'Umman' },
  'مملكة البحرين': { en: 'Kingdom of Bahrain', tr: 'Bahreyn Krallığı' },
  'البحرين': { en: 'Bahrain', tr: 'Bahreyn' },
  'المملكة الأردنية الهاشمية': { en: 'Hashemite Kingdom of Jordan', tr: 'Ürdün Haşimi Krallığı' },
  'الأردن': { en: 'Jordan', tr: 'Ürdün' },
  'الجمهورية اللبنانية': { en: 'Lebanese Republic', tr: 'Lübnan Cumhuriyeti' },
  'لبنان': { en: 'Lebanon', tr: 'Lübnan' },
  'جمهورية العراق': { en: 'Republic of Iraq', tr: 'Irak Cumhuriyeti' },
  'العراق': { en: 'Iraq', tr: 'Irak' },
  'الجمهورية الفرنسية': { en: 'French Republic', tr: 'Fransa Cumhuriyeti' },
  'فرنسا': { en: 'France', tr: 'Fransa' },
  'تركيا': { en: 'Turkey', tr: 'Türkiye' },
  'الجمهورية التركية': { en: 'Republic of Turkey', tr: 'Türkiye Cumhuriyeti' },
  'المملكة المتحدة': { en: 'United Kingdom', tr: 'Birleşik Krallık' },
  'بريطانيا': { en: 'United Kingdom', tr: 'Birleşik Krallık' },
  'الولايات المتحدة الأمريكية': { en: 'United States of America', tr: 'Amerika Birleşik Devletleri' },
  'أمريكا': { en: 'United States', tr: 'Amerika Birleşik Devletleri' },
};

// In-memory + localStorage cache for translated strings to guarantee 0ms repeat lookups
const TRANSLATION_CACHE_KEY = 'aladl_translation_cache_v1';
const translationMemoryCache: Record<string, string> = (() => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(TRANSLATION_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
})();

let cacheSaveTimer: any = null;
function setCachedTranslation(key: string, val: string) {
  translationMemoryCache[key] = val;
  if (typeof window === 'undefined') return;
  if (cacheSaveTimer) clearTimeout(cacheSaveTimer);
  cacheSaveTimer = setTimeout(() => {
    try {
      const keys = Object.keys(translationMemoryCache);
      if (keys.length > 500) {
        for (let i = 0; i < keys.length - 500; i++) {
          delete translationMemoryCache[keys[i]];
        }
      }
      localStorage.setItem(TRANSLATION_CACHE_KEY, JSON.stringify(translationMemoryCache));
    } catch {}
  }, 500);
}

/**
 * Synchronous instant glossary/cache lookup (0ms, no network)
 */
export function translateTextSync(text: string | undefined, targetLang: 'en' | 'tr', fallback?: string): string {
  if (!text || text.trim() === '') return fallback || '';
  const trimmed = text.trim();
  if (LEGAL_GLOSSARY[trimmed] && LEGAL_GLOSSARY[trimmed][targetLang]) {
    return LEGAL_GLOSSARY[trimmed][targetLang];
  }
  const cacheKey = `${targetLang}:${trimmed}`;
  if (translationMemoryCache[cacheKey]) {
    return translationMemoryCache[cacheKey];
  }
  return fallback || trimmed;
}

/**
 * Translate a single text string from Arabic to target language ('en' or 'tr')
 * with instant cache lookup and 1.5s network timeout protection
 */
export async function translateText(text: string, targetLang: 'en' | 'tr'): Promise<string> {
  if (!text || text.trim() === '') return '';
  const trimmed = text.trim();

  // 1. Check exact match in Legal Glossary
  if (LEGAL_GLOSSARY[trimmed] && LEGAL_GLOSSARY[trimmed][targetLang]) {
    return LEGAL_GLOSSARY[trimmed][targetLang];
  }

  // 2. Check instant memory cache
  const cacheKey = `${targetLang}:${trimmed}`;
  if (translationMemoryCache[cacheKey]) {
    return translationMemoryCache[cacheKey];
  }

  // 3. Try Google Translate Endpoint (Client-side GTX) with fast 1.5s timeout
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 1500);
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=${targetLang}&dt=t&q=${encodeURIComponent(trimmed)}`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const translatedStr = data[0].map((item: any) => item[0]).filter(Boolean).join('');
        if (translatedStr && translatedStr.trim() !== '') {
          const finalStr = translatedStr.trim();
          setCachedTranslation(cacheKey, finalStr);
          return finalStr;
        }
      }
    }
  } catch {
    // Fast fail on timeout or network error
  }

  // 4. Ultimate fallback: return original trimmed string immediately
  return trimmed;
}

/**
 * Helper: only translate if Arabic source changed compared to previous, or if existing target is empty
 */
async function smartTranslateField(
  arText: string | undefined,
  prevArText: string | undefined,
  existingTarget: string | undefined,
  targetLang: 'en' | 'tr',
  forceAll = false
): Promise<string> {
  if (!arText || arText.trim() === '') return existingTarget || '';
  const arTrimmed = arText.trim();
  const prevTrimmed = (prevArText || '').trim();

  // If not forcing all, and Arabic text did NOT change, and we already have a non-empty target translation, skip network!
  if (!forceAll && prevArText !== undefined && arTrimmed === prevTrimmed && existingTarget && existingTarget.trim() !== '') {
    return existingTarget;
  }

  // Also if prevArText is undefined (e.g. not passed), if existingTarget is already populated and different from arTrimmed, keep it unless forced
  if (!forceAll && prevArText === undefined && existingTarget && existingTarget.trim() !== '' && existingTarget.trim() !== arTrimmed) {
    return existingTarget;
  }

  const translated = await translateText(arTrimmed, targetLang);
  return translated || existingTarget || arTrimmed;
}

/**
 * Translate an array of text strings (like education, services, tags) in parallel
 */
export async function translateTextArray(
  texts: string[],
  targetLang: 'en' | 'tr',
  prevTexts?: string[],
  existingTargets?: string[],
  forceAll = false
): Promise<string[]> {
  if (!Array.isArray(texts) || texts.length === 0) return [];
  if (
    !forceAll &&
    Array.isArray(prevTexts) &&
    Array.isArray(existingTargets) &&
    existingTargets.length === texts.length &&
    texts.every((item, i) => item.trim() === (prevTexts[i] || '').trim())
  ) {
    return existingTargets;
  }
  return Promise.all(
    texts.map(async (item, idx) => {
      if (!item || !item.trim()) return '';
      if (
        !forceAll &&
        prevTexts &&
        existingTargets &&
        prevTexts[idx]?.trim() === item.trim() &&
        existingTargets[idx]?.trim()
      ) {
        return existingTargets[idx];
      }
      const translated = await translateText(item, targetLang);
      return translated || item;
    })
  );
}

/**
 * Automatically translate and fill only modified/missing English & Turkish fields of a Partner
 */
export async function autoTranslatePartner(partner: Partner, prevPartner?: Partner | null, forceAll = false): Promise<Partner> {
  const [
    nameEn, nameTr,
    titleEn, titleTr,
    specialtyEn, specialtyTr,
    bioEn, bioTr,
    barAdmissionEn, barAdmissionTr,
    educationEn, educationTr
  ] = await Promise.all([
    smartTranslateField(partner.name, prevPartner?.name, partner.nameEn, 'en', forceAll),
    smartTranslateField(partner.name, prevPartner?.name, partner.nameTr, 'tr', forceAll),
    smartTranslateField(partner.title, prevPartner?.title, partner.titleEn, 'en', forceAll),
    smartTranslateField(partner.title, prevPartner?.title, partner.titleTr, 'tr', forceAll),
    smartTranslateField(partner.specialty, prevPartner?.specialty, partner.specialtyEn, 'en', forceAll),
    smartTranslateField(partner.specialty, prevPartner?.specialty, partner.specialtyTr, 'tr', forceAll),
    smartTranslateField(partner.bio, prevPartner?.bio, partner.bioEn, 'en', forceAll),
    smartTranslateField(partner.bio, prevPartner?.bio, partner.bioTr, 'tr', forceAll),
    smartTranslateField(partner.barAdmission, prevPartner?.barAdmission, partner.barAdmissionEn, 'en', forceAll),
    smartTranslateField(partner.barAdmission, prevPartner?.barAdmission, partner.barAdmissionTr, 'tr', forceAll),
    partner.education?.length ? translateTextArray(partner.education, 'en', prevPartner?.education, partner.educationEn, forceAll) : Promise.resolve(partner.educationEn || []),
    partner.education?.length ? translateTextArray(partner.education, 'tr', prevPartner?.education, partner.educationTr, forceAll) : Promise.resolve(partner.educationTr || []),
  ]);

  return {
    ...partner,
    nameEn: nameEn || partner.nameEn || partner.name,
    nameTr: nameTr || partner.nameTr || partner.name,
    titleEn: titleEn || partner.titleEn || partner.title,
    titleTr: titleTr || partner.titleTr || partner.title,
    specialtyEn: specialtyEn || partner.specialtyEn || partner.specialty,
    specialtyTr: specialtyTr || partner.specialtyTr || partner.specialty,
    bioEn: bioEn || partner.bioEn || partner.bio,
    bioTr: bioTr || partner.bioTr || partner.bio,
    barAdmissionEn: barAdmissionEn || partner.barAdmissionEn || partner.barAdmission,
    barAdmissionTr: barAdmissionTr || partner.barAdmissionTr || partner.barAdmission,
    educationEn: educationEn?.length ? educationEn : partner.educationEn,
    educationTr: educationTr?.length ? educationTr : partner.educationTr,
  };
}

/**
 * Automatically translate and fill only modified/missing English & Turkish fields of a Practice Area
 */
export async function autoTranslatePracticeArea(practice: PracticeArea, prevPractice?: PracticeArea | null, forceAll = false): Promise<PracticeArea> {
  const [
    titleEn, titleTr,
    categoryLabelEn, categoryLabelTr,
    shortDescEn, shortDescTr,
    fullDescEn, fullDescTr,
    keyServicesEn, keyServicesTr
  ] = await Promise.all([
    smartTranslateField(practice.title, prevPractice?.title, practice.titleEn, 'en', forceAll),
    smartTranslateField(practice.title, prevPractice?.title, practice.titleTr, 'tr', forceAll),
    smartTranslateField(practice.categoryLabelAr, prevPractice?.categoryLabelAr, practice.categoryLabelEn, 'en', forceAll),
    smartTranslateField(practice.categoryLabelAr, prevPractice?.categoryLabelAr, practice.categoryLabelTr, 'tr', forceAll),
    smartTranslateField(practice.shortDesc, prevPractice?.shortDesc, practice.shortDescEn, 'en', forceAll),
    smartTranslateField(practice.shortDesc, prevPractice?.shortDesc, practice.shortDescTr, 'tr', forceAll),
    smartTranslateField(practice.fullDesc, prevPractice?.fullDesc, practice.fullDescEn, 'en', forceAll),
    smartTranslateField(practice.fullDesc, prevPractice?.fullDesc, practice.fullDescTr, 'tr', forceAll),
    practice.keyServices?.length ? translateTextArray(practice.keyServices, 'en', prevPractice?.keyServices, practice.keyServicesEn, forceAll) : Promise.resolve(practice.keyServicesEn || []),
    practice.keyServices?.length ? translateTextArray(practice.keyServices, 'tr', prevPractice?.keyServices, practice.keyServicesTr, forceAll) : Promise.resolve(practice.keyServicesTr || []),
  ]);

  return {
    ...practice,
    titleEn: titleEn || practice.titleEn || practice.title,
    titleTr: titleTr || practice.titleTr || practice.title,
    categoryLabelEn: categoryLabelEn || practice.categoryLabelEn,
    categoryLabelTr: categoryLabelTr || practice.categoryLabelTr,
    shortDescEn: shortDescEn || practice.shortDescEn || practice.shortDesc,
    shortDescTr: shortDescTr || practice.shortDescTr || practice.shortDesc,
    fullDescEn: fullDescEn || practice.fullDescEn || practice.fullDesc,
    fullDescTr: fullDescTr || practice.fullDescTr || practice.fullDesc,
    keyServicesEn: keyServicesEn?.length ? keyServicesEn : practice.keyServicesEn,
    keyServicesTr: keyServicesTr?.length ? keyServicesTr : practice.keyServicesTr,
  };
}

/**
 * Automatically translate Case Study (only changed/missing fields)
 */
export async function autoTranslateCaseStudy(item: CaseStudy, prevItem?: CaseStudy | null, forceAll = false): Promise<CaseStudy> {
  const [
    titleEn, titleTr,
    categoryTr,
    summaryTr,
    outcomeTr,
    highlightTr
  ] = await Promise.all([
    smartTranslateField(item.title, prevItem?.title, item.titleEn, 'en', forceAll),
    smartTranslateField(item.title, prevItem?.title, item.titleTr, 'tr', forceAll),
    smartTranslateField(item.category, prevItem?.category, item.categoryTr, 'tr', forceAll),
    smartTranslateField(item.summary, prevItem?.summary, item.summaryTr, 'tr', forceAll),
    smartTranslateField(item.outcome, prevItem?.outcome, item.outcomeTr, 'tr', forceAll),
    smartTranslateField(item.highlight, prevItem?.highlight, item.highlightTr, 'tr', forceAll),
  ]);

  return {
    ...item,
    titleEn: titleEn || item.titleEn || item.title,
    titleTr: titleTr || item.titleTr || item.title,
    categoryTr: categoryTr || item.categoryTr || item.category,
    summaryTr: summaryTr || item.summaryTr || item.summary,
    outcomeTr: outcomeTr || item.outcomeTr || item.outcome,
    highlightTr: highlightTr || item.highlightTr || item.highlight,
  };
}

/**
 * Automatically translate Testimonial (only changed/missing fields)
 */
export async function autoTranslateTestimonial(item: Testimonial, prevItem?: Testimonial | null, forceAll = false): Promise<Testimonial> {
  const [
    clientNameEn, clientNameTr,
    clientRoleEn, clientRoleTr,
    companyEn, companyTr,
    contentEn, contentTr,
    caseTypeTr
  ] = await Promise.all([
    smartTranslateField(item.clientName, prevItem?.clientName, item.clientNameEn, 'en', forceAll),
    smartTranslateField(item.clientName, prevItem?.clientName, item.clientNameTr, 'tr', forceAll),
    smartTranslateField(item.clientRole, prevItem?.clientRole, item.clientRoleEn, 'en', forceAll),
    smartTranslateField(item.clientRole, prevItem?.clientRole, item.clientRoleTr, 'tr', forceAll),
    smartTranslateField(item.company, prevItem?.company, item.companyEn, 'en', forceAll),
    smartTranslateField(item.company, prevItem?.company, item.companyTr, 'tr', forceAll),
    smartTranslateField(item.content, prevItem?.content, item.contentEn, 'en', forceAll),
    smartTranslateField(item.content, prevItem?.content, item.contentTr, 'tr', forceAll),
    smartTranslateField(item.caseType, prevItem?.caseType, item.caseTypeTr, 'tr', forceAll),
  ]);

  return {
    ...item,
    clientNameEn: clientNameEn || item.clientNameEn || item.clientName,
    clientNameTr: clientNameTr || item.clientNameTr || item.clientName,
    clientRoleEn: clientRoleEn || item.clientRoleEn || item.clientRole,
    clientRoleTr: clientRoleTr || item.clientRoleTr || item.clientRole,
    companyEn: companyEn || item.companyEn || item.company,
    companyTr: companyTr || item.companyTr || item.company,
    contentEn: contentEn || item.contentEn || item.content,
    contentTr: contentTr || item.contentTr || item.content,
    caseTypeTr: caseTypeTr || item.caseTypeTr || item.caseType,
  };
}

/**
 * Automatically translate BlogPost (only changed/missing fields)
 */
export async function autoTranslateBlogPost(post: BlogPost, prevPost?: BlogPost | null, forceAll = false): Promise<BlogPost> {
  const [
    titleEn, titleTr,
    excerptTr,
    contentTr,
    categoryTr,
    authorRoleTr,
    readTimeTr,
    tagsTr
  ] = await Promise.all([
    smartTranslateField(post.title, prevPost?.title, post.titleEn, 'en', forceAll),
    smartTranslateField(post.title, prevPost?.title, post.titleTr, 'tr', forceAll),
    smartTranslateField(post.excerpt, prevPost?.excerpt, post.excerptTr, 'tr', forceAll),
    smartTranslateField(post.content, prevPost?.content, post.contentTr, 'tr', forceAll),
    smartTranslateField(post.category, prevPost?.category, post.categoryTr, 'tr', forceAll),
    smartTranslateField(post.authorRole, prevPost?.authorRole, post.authorRoleTr, 'tr', forceAll),
    smartTranslateField(post.readTime, prevPost?.readTime, post.readTimeTr, 'tr', forceAll),
    post.tags?.length ? translateTextArray(post.tags, 'tr', prevPost?.tags, post.tagsTr, forceAll) : Promise.resolve(post.tagsTr || []),
  ]);

  return {
    ...post,
    titleEn: titleEn || post.titleEn || post.title,
    titleTr: titleTr || post.titleTr || post.title,
    excerptTr: excerptTr || post.excerptTr || post.excerpt,
    contentTr: contentTr || post.contentTr || post.content,
    categoryTr: categoryTr || post.categoryTr || post.category,
    authorRoleTr: authorRoleTr || post.authorRoleTr || post.authorRole,
    readTimeTr: readTimeTr || post.readTimeTr || post.readTime,
    tagsTr: tagsTr?.length ? tagsTr : post.tagsTr,
  };
}

/**
 * Automatically translate Office Location (only changed/missing fields)
 */
export async function autoTranslateOffice(office: OfficeLocation, prevOffice?: OfficeLocation | null, forceAll = false): Promise<OfficeLocation> {
  const [
    cityEn, cityTr,
    countryEn, countryTr,
    addressEn, addressTr
  ] = await Promise.all([
    smartTranslateField(office.cityAr, prevOffice?.cityAr, office.cityEn, 'en', forceAll),
    smartTranslateField(office.cityAr, prevOffice?.cityAr, office.cityTr, 'tr', forceAll),
    smartTranslateField(office.countryAr, prevOffice?.countryAr, office.countryEn, 'en', forceAll),
    smartTranslateField(office.countryAr, prevOffice?.countryAr, office.countryTr, 'tr', forceAll),
    smartTranslateField(office.addressAr, prevOffice?.addressAr, office.addressEn, 'en', forceAll),
    smartTranslateField(office.addressAr, prevOffice?.addressAr, office.addressTr, 'tr', forceAll),
  ]);

  return {
    ...office,
    cityEn: cityEn || office.cityEn || office.cityAr,
    cityTr: cityTr || office.cityTr || office.cityAr,
    countryEn: countryEn || office.countryEn || office.countryAr,
    countryTr: countryTr || office.countryTr || office.countryAr,
    addressEn: addressEn || office.addressEn || office.addressAr,
    addressTr: addressTr || office.addressTr || office.addressAr,
  };
}

/**
 * Automatically translate Site Settings (only changed/missing fields)
 */
export async function autoTranslateSettings(settings: SiteSettings, prevSettings?: SiteSettings | null, forceAll = false): Promise<SiteSettings> {
  const prev = prevSettings || undefined;
  const [
    firmNameEn, firmNameTr,
    sloganEn, sloganTr,
    subSloganEn, subSloganTr,
    aboutHeadingEn, aboutHeadingTr,
    aboutBadgeEn, aboutBadgeTr,
    aboutTextEn, aboutTextTr,
    aboutVisionEn, aboutVisionTr,
    aboutMethodologyEn, aboutMethodologyTr,
    aboutConfidentialityEn, aboutConfidentialityTr,
    aboutVisionPoint1En, aboutVisionPoint1Tr,
    aboutVisionPoint2En, aboutVisionPoint2Tr,
    aboutMethodologyPoint1En, aboutMethodologyPoint1Tr,
    aboutMethodologyPoint2En, aboutMethodologyPoint2Tr,
    aboutConfidentialityPoint1En, aboutConfidentialityPoint1Tr,
    aboutConfidentialityPoint2En, aboutConfidentialityPoint2Tr,
    aboutRankingTitleEn, aboutRankingTitleTr,
    aboutRankingDescEn, aboutRankingDescTr,
    aboutCtaTextEn, aboutCtaTextTr,
    addressEn, addressTr,
    countryEn, countryTr,
    cityEn, cityTr,
    workingHoursEn, workingHoursTr,
    navbarSubtitleEn, navbarSubtitleTr
  ] = await Promise.all([
    smartTranslateField(settings.firmNameAr, prev?.firmNameAr, settings.firmNameEn, 'en', forceAll),
    smartTranslateField(settings.firmNameAr, prev?.firmNameAr, settings.firmNameTr, 'tr', forceAll),
    smartTranslateField(settings.sloganAr, prev?.sloganAr, settings.sloganEn, 'en', forceAll),
    smartTranslateField(settings.sloganAr, prev?.sloganAr, settings.sloganTr, 'tr', forceAll),
    smartTranslateField(settings.subSloganAr, prev?.subSloganAr, settings.subSloganEn, 'en', forceAll),
    smartTranslateField(settings.subSloganAr, prev?.subSloganAr, settings.subSloganTr, 'tr', forceAll),
    smartTranslateField(settings.aboutHeadingAr, prev?.aboutHeadingAr, settings.aboutHeadingEn, 'en', forceAll),
    smartTranslateField(settings.aboutHeadingAr, prev?.aboutHeadingAr, settings.aboutHeadingTr, 'tr', forceAll),
    smartTranslateField(settings.aboutBadgeAr, prev?.aboutBadgeAr, settings.aboutBadgeEn, 'en', forceAll),
    smartTranslateField(settings.aboutBadgeAr, prev?.aboutBadgeAr, settings.aboutBadgeTr, 'tr', forceAll),
    smartTranslateField(settings.aboutTextAr, prev?.aboutTextAr, settings.aboutTextEn, 'en', forceAll),
    smartTranslateField(settings.aboutTextAr, prev?.aboutTextAr, settings.aboutTextTr, 'tr', forceAll),
    smartTranslateField(settings.aboutVisionAr, prev?.aboutVisionAr, settings.aboutVisionEn, 'en', forceAll),
    smartTranslateField(settings.aboutVisionAr, prev?.aboutVisionAr, settings.aboutVisionTr, 'tr', forceAll),
    smartTranslateField(settings.aboutMethodologyAr, prev?.aboutMethodologyAr, settings.aboutMethodologyEn, 'en', forceAll),
    smartTranslateField(settings.aboutMethodologyAr, prev?.aboutMethodologyAr, settings.aboutMethodologyTr, 'tr', forceAll),
    smartTranslateField(settings.aboutConfidentialityAr, prev?.aboutConfidentialityAr, settings.aboutConfidentialityEn, 'en', forceAll),
    smartTranslateField(settings.aboutConfidentialityAr, prev?.aboutConfidentialityAr, settings.aboutConfidentialityTr, 'tr', forceAll),
    smartTranslateField(settings.aboutVisionPoint1Ar, prev?.aboutVisionPoint1Ar, settings.aboutVisionPoint1En, 'en', forceAll),
    smartTranslateField(settings.aboutVisionPoint1Ar, prev?.aboutVisionPoint1Ar, settings.aboutVisionPoint1Tr, 'tr', forceAll),
    smartTranslateField(settings.aboutVisionPoint2Ar, prev?.aboutVisionPoint2Ar, settings.aboutVisionPoint2En, 'en', forceAll),
    smartTranslateField(settings.aboutVisionPoint2Ar, prev?.aboutVisionPoint2Ar, settings.aboutVisionPoint2Tr, 'tr', forceAll),
    smartTranslateField(settings.aboutMethodologyPoint1Ar, prev?.aboutMethodologyPoint1Ar, settings.aboutMethodologyPoint1En, 'en', forceAll),
    smartTranslateField(settings.aboutMethodologyPoint1Ar, prev?.aboutMethodologyPoint1Ar, settings.aboutMethodologyPoint1Tr, 'tr', forceAll),
    smartTranslateField(settings.aboutMethodologyPoint2Ar, prev?.aboutMethodologyPoint2Ar, settings.aboutMethodologyPoint2En, 'en', forceAll),
    smartTranslateField(settings.aboutMethodologyPoint2Ar, prev?.aboutMethodologyPoint2Ar, settings.aboutMethodologyPoint2Tr, 'tr', forceAll),
    smartTranslateField(settings.aboutConfidentialityPoint1Ar, prev?.aboutConfidentialityPoint1Ar, settings.aboutConfidentialityPoint1En, 'en', forceAll),
    smartTranslateField(settings.aboutConfidentialityPoint1Ar, prev?.aboutConfidentialityPoint1Ar, settings.aboutConfidentialityPoint1Tr, 'tr', forceAll),
    smartTranslateField(settings.aboutConfidentialityPoint2Ar, prev?.aboutConfidentialityPoint2Ar, settings.aboutConfidentialityPoint2En, 'en', forceAll),
    smartTranslateField(settings.aboutConfidentialityPoint2Ar, prev?.aboutConfidentialityPoint2Ar, settings.aboutConfidentialityPoint2Tr, 'tr', forceAll),
    smartTranslateField(settings.aboutRankingTitleAr, prev?.aboutRankingTitleAr, settings.aboutRankingTitleEn, 'en', forceAll),
    smartTranslateField(settings.aboutRankingTitleAr, prev?.aboutRankingTitleAr, settings.aboutRankingTitleTr, 'tr', forceAll),
    smartTranslateField(settings.aboutRankingDescAr, prev?.aboutRankingDescAr, settings.aboutRankingDescEn, 'en', forceAll),
    smartTranslateField(settings.aboutRankingDescAr, prev?.aboutRankingDescAr, settings.aboutRankingDescTr, 'tr', forceAll),
    smartTranslateField(settings.aboutCtaTextAr, prev?.aboutCtaTextAr, settings.aboutCtaTextEn, 'en', forceAll),
    smartTranslateField(settings.aboutCtaTextAr, prev?.aboutCtaTextAr, settings.aboutCtaTextTr, 'tr', forceAll),
    smartTranslateField(settings.addressAr, prev?.addressAr, settings.addressEn, 'en', forceAll),
    smartTranslateField(settings.addressAr, prev?.addressAr, settings.addressTr, 'tr', forceAll),
    smartTranslateField(settings.countryAr, prev?.countryAr, settings.countryEn, 'en', forceAll),
    smartTranslateField(settings.countryAr, prev?.countryAr, settings.countryTr, 'tr', forceAll),
    smartTranslateField(settings.cityAr, prev?.cityAr, settings.cityEn, 'en', forceAll),
    smartTranslateField(settings.cityAr, prev?.cityAr, settings.cityTr, 'tr', forceAll),
    smartTranslateField(settings.workingHoursAr, prev?.workingHoursAr, settings.workingHoursEn, 'en', forceAll),
    smartTranslateField(settings.workingHoursAr, prev?.workingHoursAr, settings.workingHoursTr, 'tr', forceAll),
    smartTranslateField(settings.navbarSubtitleAr, prev?.navbarSubtitleAr, settings.navbarSubtitleEn, 'en', forceAll),
    smartTranslateField(settings.navbarSubtitleAr, prev?.navbarSubtitleAr, settings.navbarSubtitleTr, 'tr', forceAll),
  ]);

  return {
    ...settings,
    firmNameEn: firmNameEn || settings.firmNameEn || settings.firmNameAr,
    firmNameTr: firmNameTr || settings.firmNameTr || settings.firmNameAr,
    sloganEn: sloganEn || settings.sloganEn || settings.sloganAr,
    sloganTr: sloganTr || settings.sloganTr || settings.sloganAr,
    subSloganEn: subSloganEn || settings.subSloganEn || settings.subSloganAr,
    subSloganTr: subSloganTr || settings.subSloganTr || settings.subSloganAr,
    aboutHeadingEn: aboutHeadingEn || settings.aboutHeadingEn || settings.aboutHeadingAr,
    aboutHeadingTr: aboutHeadingTr || settings.aboutHeadingTr || settings.aboutHeadingAr,
    aboutBadgeEn: aboutBadgeEn || settings.aboutBadgeEn || settings.aboutBadgeAr,
    aboutBadgeTr: aboutBadgeTr || settings.aboutBadgeTr || settings.aboutBadgeAr,
    aboutTextEn: aboutTextEn || settings.aboutTextEn || settings.aboutTextAr,
    aboutTextTr: aboutTextTr || settings.aboutTextTr || settings.aboutTextAr,
    aboutVisionEn: aboutVisionEn || settings.aboutVisionEn || settings.aboutVisionAr,
    aboutVisionTr: aboutVisionTr || settings.aboutVisionTr || settings.aboutVisionAr,
    aboutMethodologyEn: aboutMethodologyEn || settings.aboutMethodologyEn || settings.aboutMethodologyAr,
    aboutMethodologyTr: aboutMethodologyTr || settings.aboutMethodologyTr || settings.aboutMethodologyAr,
    aboutConfidentialityEn: aboutConfidentialityEn || settings.aboutConfidentialityEn || settings.aboutConfidentialityAr,
    aboutConfidentialityTr: aboutConfidentialityTr || settings.aboutConfidentialityTr || settings.aboutConfidentialityAr,
    aboutVisionPoint1En: aboutVisionPoint1En || settings.aboutVisionPoint1En || settings.aboutVisionPoint1Ar,
    aboutVisionPoint1Tr: aboutVisionPoint1Tr || settings.aboutVisionPoint1Tr || settings.aboutVisionPoint1Ar,
    aboutVisionPoint2En: aboutVisionPoint2En || settings.aboutVisionPoint2En || settings.aboutVisionPoint2Ar,
    aboutVisionPoint2Tr: aboutVisionPoint2Tr || settings.aboutVisionPoint2Tr || settings.aboutVisionPoint2Ar,
    aboutMethodologyPoint1En: aboutMethodologyPoint1En || settings.aboutMethodologyPoint1En || settings.aboutMethodologyPoint1Ar,
    aboutMethodologyPoint1Tr: aboutMethodologyPoint1Tr || settings.aboutMethodologyPoint1Tr || settings.aboutMethodologyPoint1Ar,
    aboutMethodologyPoint2En: aboutMethodologyPoint2En || settings.aboutMethodologyPoint2En || settings.aboutMethodologyPoint2Ar,
    aboutMethodologyPoint2Tr: aboutMethodologyPoint2Tr || settings.aboutMethodologyPoint2Tr || settings.aboutMethodologyPoint2Ar,
    aboutConfidentialityPoint1En: aboutConfidentialityPoint1En || settings.aboutConfidentialityPoint1En || settings.aboutConfidentialityPoint1Ar,
    aboutConfidentialityPoint1Tr: aboutConfidentialityPoint1Tr || settings.aboutConfidentialityPoint1Tr || settings.aboutConfidentialityPoint1Ar,
    aboutConfidentialityPoint2En: aboutConfidentialityPoint2En || settings.aboutConfidentialityPoint2En || settings.aboutConfidentialityPoint2Ar,
    aboutConfidentialityPoint2Tr: aboutConfidentialityPoint2Tr || settings.aboutConfidentialityPoint2Tr || settings.aboutConfidentialityPoint2Ar,
    aboutRankingTitleEn: aboutRankingTitleEn || settings.aboutRankingTitleEn || settings.aboutRankingTitleAr,
    aboutRankingTitleTr: aboutRankingTitleTr || settings.aboutRankingTitleTr || settings.aboutRankingTitleAr,
    aboutRankingDescEn: aboutRankingDescEn || settings.aboutRankingDescEn || settings.aboutRankingDescAr,
    aboutRankingDescTr: aboutRankingDescTr || settings.aboutRankingDescTr || settings.aboutRankingDescAr,
    aboutCtaTextEn: aboutCtaTextEn || settings.aboutCtaTextEn || settings.aboutCtaTextAr,
    aboutCtaTextTr: aboutCtaTextTr || settings.aboutCtaTextTr || settings.aboutCtaTextAr,
    addressEn: addressEn || settings.addressEn || settings.addressAr,
    addressTr: addressTr || settings.addressTr || settings.addressAr,
    countryEn: countryEn || settings.countryEn || settings.countryAr,
    countryTr: countryTr || settings.countryTr || settings.countryAr,
    cityEn: cityEn || settings.cityEn || settings.cityAr,
    cityTr: cityTr || settings.cityTr || settings.cityAr,
    workingHoursEn: workingHoursEn || settings.workingHoursEn || settings.workingHoursAr,
    workingHoursTr: workingHoursTr || settings.workingHoursTr || settings.workingHoursAr,
    navbarSubtitleEn: navbarSubtitleEn || settings.navbarSubtitleEn || settings.navbarSubtitleAr,
    navbarSubtitleTr: navbarSubtitleTr || settings.navbarSubtitleTr || settings.navbarSubtitleAr,
  };
}

/**
 * Translate the ENTIRE database (Partners, Practices, Cases, Testimonials, Blog, Offices, Settings)
 */
export async function autoTranslateAllSiteData(
  onProgress?: (percent: number, currentTask: string) => void
): Promise<{ totalCount: number }> {
  let count = 0;

  // 1. Settings
  onProgress?.(10, 'جاري ترجمة إعدادات وهوية الموقع...');
  const currentSettings = storageService.getSettings();
  const updatedSettings = await autoTranslateSettings(currentSettings);
  storageService.saveSettings(updatedSettings);
  count++;

  // 2. Partners
  onProgress?.(25, 'جاري ترجمة بيانات الشركاء والمحامين...');
  const partners = storageService.getPartners();
  for (const p of partners) {
    const updated = await autoTranslatePartner(p);
    storageService.savePartner(updated);
    count++;
  }

  // 3. Practice Areas
  onProgress?.(45, 'جاري ترجمة مجالات الاختصاص والخدمات...');
  const practices = storageService.getPracticeAreas();
  for (const pr of practices) {
    const updated = await autoTranslatePracticeArea(pr);
    storageService.savePracticeArea(updated);
    count++;
  }

  // 4. Case Studies
  onProgress?.(60, 'جاري ترجمة الإنجازات والصفقات...');
  const cases = storageService.getCaseStudies();
  for (const c of cases) {
    const updated = await autoTranslateCaseStudy(c);
    storageService.saveCaseStudy(updated);
    count++;
  }

  // 5. Testimonials
  onProgress?.(75, 'جاري ترجمة آراء وشهادات العملاء...');
  const testimonials = storageService.getTestimonials();
  for (const t of testimonials) {
    const updated = await autoTranslateTestimonial(t);
    storageService.saveTestimonial(updated);
    count++;
  }

  // 6. Blog Posts
  onProgress?.(85, 'جاري ترجمة المقالات والتحليلات...');
  const blogs = storageService.getBlogPosts();
  for (const b of blogs) {
    const updated = await autoTranslateBlogPost(b);
    storageService.saveBlogPost(updated);
    count++;
  }

  // 7. Offices
  onProgress?.(95, 'جاري ترجمة مقار المكاتب الدولية...');
  const offices = storageService.getOffices();
  for (const off of offices) {
    const updated = await autoTranslateOffice(off);
    storageService.saveOffice(updated);
    count++;
  }

  onProgress?.(100, 'اكتملت الترجمة والمزامنة الشاملة بنجاح!');
  return { totalCount: count };
}
