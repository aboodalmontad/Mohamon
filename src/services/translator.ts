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
  'إسطنبول': { en: 'Istanbul', tr: 'İstanbul' },
  'دبي': { en: 'Dubai', tr: 'Dubai' },
  'لندن': { en: 'London', tr: 'Londra' },
  'المملكة العربية السعودية': { en: 'Kingdom of Saudi Arabia', tr: 'Suudi Arabistan Krallığı' },
  'تركيا': { en: 'Turkey', tr: 'Türkiye' },
  'الإمارات العربية المتحدة': { en: 'United Arab Emirates', tr: 'Birleşik Arap Emirlikleri' },
  'المملكة المتحدة': { en: 'United Kingdom', tr: 'Birleşik Krallık' },
};

/**
 * Translate a single text string from Arabic to target language ('en' or 'tr')
 */
export async function translateText(text: string, targetLang: 'en' | 'tr'): Promise<string> {
  if (!text || text.trim() === '') return '';
  const trimmed = text.trim();

  // 1. Check exact match in Legal Glossary
  if (LEGAL_GLOSSARY[trimmed] && LEGAL_GLOSSARY[trimmed][targetLang]) {
    return LEGAL_GLOSSARY[trimmed][targetLang];
  }

  // 2. Try Google Translate Endpoint (Client-side GTX)
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=${targetLang}&dt=t&q=${encodeURIComponent(trimmed)}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const translatedStr = data[0].map((item: any) => item[0]).filter(Boolean).join('');
        if (translatedStr && translatedStr.trim() !== '') {
          return translatedStr.trim();
        }
      }
    }
  } catch (err) {
    console.warn(`[Translator] Google Translate API error for: "${trimmed.substring(0, 30)}..."`, err);
  }

  // 3. Fallback to MyMemory Free Translation API
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=ar|${targetLang}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data?.responseData?.translatedText) {
        const result = data.responseData.translatedText;
        // Verify response is not an error quota message
        if (!result.includes('MYMEMORY WARNING') && !result.includes('QUERY LENGTH LIMIT')) {
          return result.trim();
        }
      }
    }
  } catch (err) {
    console.warn(`[Translator] MyMemory API fallback error`, err);
  }

  // 4. Ultimate fallback: return original trimmed string
  return trimmed;
}

/**
 * Translate an array of text strings (like education, services, tags)
 */
export async function translateTextArray(texts: string[], targetLang: 'en' | 'tr'): Promise<string[]> {
  if (!Array.isArray(texts) || texts.length === 0) return [];
  const results: string[] = [];
  for (const item of texts) {
    if (item && item.trim()) {
      const translated = await translateText(item, targetLang);
      results.push(translated || item);
    }
  }
  return results;
}

/**
 * Automatically translate and fill all missing/outdated English & Turkish fields of a Partner
 */
export async function autoTranslatePartner(partner: Partner): Promise<Partner> {
  const [
    nameEn, nameTr,
    titleEn, titleTr,
    specialtyEn, specialtyTr,
    bioEn, bioTr,
    barAdmissionEn, barAdmissionTr,
    educationEn, educationTr
  ] = await Promise.all([
    partner.name ? translateText(partner.name, 'en') : Promise.resolve(partner.nameEn || ''),
    partner.name ? translateText(partner.name, 'tr') : Promise.resolve(partner.nameTr || ''),
    partner.title ? translateText(partner.title, 'en') : Promise.resolve(partner.titleEn || ''),
    partner.title ? translateText(partner.title, 'tr') : Promise.resolve(partner.titleTr || ''),
    partner.specialty ? translateText(partner.specialty, 'en') : Promise.resolve(partner.specialtyEn || ''),
    partner.specialty ? translateText(partner.specialty, 'tr') : Promise.resolve(partner.specialtyTr || ''),
    partner.bio ? translateText(partner.bio, 'en') : Promise.resolve(partner.bioEn || ''),
    partner.bio ? translateText(partner.bio, 'tr') : Promise.resolve(partner.bioTr || ''),
    partner.barAdmission ? translateText(partner.barAdmission, 'en') : Promise.resolve(partner.barAdmissionEn || ''),
    partner.barAdmission ? translateText(partner.barAdmission, 'tr') : Promise.resolve(partner.barAdmissionTr || ''),
    partner.education?.length ? translateTextArray(partner.education, 'en') : Promise.resolve(partner.educationEn || []),
    partner.education?.length ? translateTextArray(partner.education, 'tr') : Promise.resolve(partner.educationTr || []),
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
 * Automatically translate and fill all missing/outdated English & Turkish fields of a Practice Area
 */
export async function autoTranslatePracticeArea(practice: PracticeArea): Promise<PracticeArea> {
  const [
    titleEn, titleTr,
    categoryLabelEn, categoryLabelTr,
    shortDescEn, shortDescTr,
    fullDescEn, fullDescTr,
    keyServicesEn, keyServicesTr
  ] = await Promise.all([
    practice.title ? translateText(practice.title, 'en') : Promise.resolve(practice.titleEn || ''),
    practice.title ? translateText(practice.title, 'tr') : Promise.resolve(practice.titleTr || ''),
    practice.categoryLabelAr ? translateText(practice.categoryLabelAr, 'en') : Promise.resolve(practice.categoryLabelEn || ''),
    practice.categoryLabelAr ? translateText(practice.categoryLabelAr, 'tr') : Promise.resolve(practice.categoryLabelTr || ''),
    practice.shortDesc ? translateText(practice.shortDesc, 'en') : Promise.resolve(practice.shortDescEn || ''),
    practice.shortDesc ? translateText(practice.shortDesc, 'tr') : Promise.resolve(practice.shortDescTr || ''),
    practice.fullDesc ? translateText(practice.fullDesc, 'en') : Promise.resolve(practice.fullDescEn || ''),
    practice.fullDesc ? translateText(practice.fullDesc, 'tr') : Promise.resolve(practice.fullDescTr || ''),
    practice.keyServices?.length ? translateTextArray(practice.keyServices, 'en') : Promise.resolve(practice.keyServicesEn || []),
    practice.keyServices?.length ? translateTextArray(practice.keyServices, 'tr') : Promise.resolve(practice.keyServicesTr || []),
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
 * Automatically translate Case Study
 */
export async function autoTranslateCaseStudy(item: CaseStudy): Promise<CaseStudy> {
  const [
    titleEn, titleTr,
    categoryTr,
    summaryTr,
    outcomeTr,
    highlightTr
  ] = await Promise.all([
    item.title ? translateText(item.title, 'en') : Promise.resolve(item.titleEn || ''),
    item.title ? translateText(item.title, 'tr') : Promise.resolve(item.titleTr || ''),
    item.category ? translateText(item.category, 'tr') : Promise.resolve(item.categoryTr || ''),
    item.summary ? translateText(item.summary, 'tr') : Promise.resolve(item.summaryTr || ''),
    item.outcome ? translateText(item.outcome, 'tr') : Promise.resolve(item.outcomeTr || ''),
    item.highlight ? translateText(item.highlight, 'tr') : Promise.resolve(item.highlightTr || ''),
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
 * Automatically translate Testimonial
 */
export async function autoTranslateTestimonial(item: Testimonial): Promise<Testimonial> {
  const [
    clientNameEn, clientNameTr,
    clientRoleEn, clientRoleTr,
    companyEn, companyTr,
    contentEn, contentTr,
    caseTypeTr
  ] = await Promise.all([
    item.clientName ? translateText(item.clientName, 'en') : Promise.resolve(item.clientNameEn || ''),
    item.clientName ? translateText(item.clientName, 'tr') : Promise.resolve(item.clientNameTr || ''),
    item.clientRole ? translateText(item.clientRole, 'en') : Promise.resolve(item.clientRoleEn || ''),
    item.clientRole ? translateText(item.clientRole, 'tr') : Promise.resolve(item.clientRoleTr || ''),
    item.company ? translateText(item.company, 'en') : Promise.resolve(item.companyEn || ''),
    item.company ? translateText(item.company, 'tr') : Promise.resolve(item.companyTr || ''),
    item.content ? translateText(item.content, 'en') : Promise.resolve(item.contentEn || ''),
    item.content ? translateText(item.content, 'tr') : Promise.resolve(item.contentTr || ''),
    item.caseType ? translateText(item.caseType, 'tr') : Promise.resolve(item.caseTypeTr || ''),
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
 * Automatically translate BlogPost
 */
export async function autoTranslateBlogPost(post: BlogPost): Promise<BlogPost> {
  const [
    titleEn, titleTr,
    excerptTr,
    contentTr,
    categoryTr,
    authorRoleTr,
    readTimeTr,
    tagsTr
  ] = await Promise.all([
    post.title ? translateText(post.title, 'en') : Promise.resolve(post.titleEn || ''),
    post.title ? translateText(post.title, 'tr') : Promise.resolve(post.titleTr || ''),
    post.excerpt ? translateText(post.excerpt, 'tr') : Promise.resolve(post.excerptTr || ''),
    post.content ? translateText(post.content, 'tr') : Promise.resolve(post.contentTr || ''),
    post.category ? translateText(post.category, 'tr') : Promise.resolve(post.categoryTr || ''),
    post.authorRole ? translateText(post.authorRole, 'tr') : Promise.resolve(post.authorRoleTr || ''),
    post.readTime ? translateText(post.readTime, 'tr') : Promise.resolve(post.readTimeTr || ''),
    post.tags?.length ? translateTextArray(post.tags, 'tr') : Promise.resolve(post.tagsTr || []),
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
 * Automatically translate Office Location
 */
export async function autoTranslateOffice(office: OfficeLocation): Promise<OfficeLocation> {
  const [
    cityEn, cityTr,
    countryEn, countryTr,
    addressEn, addressTr
  ] = await Promise.all([
    office.cityAr ? translateText(office.cityAr, 'en') : Promise.resolve(office.cityEn || ''),
    office.cityAr ? translateText(office.cityAr, 'tr') : Promise.resolve(office.cityTr || ''),
    office.countryAr ? translateText(office.countryAr, 'en') : Promise.resolve(office.countryEn || ''),
    office.countryAr ? translateText(office.countryAr, 'tr') : Promise.resolve(office.countryTr || ''),
    office.addressAr ? translateText(office.addressAr, 'en') : Promise.resolve(office.addressEn || ''),
    office.addressAr ? translateText(office.addressAr, 'tr') : Promise.resolve(office.addressTr || ''),
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
 * Automatically translate Site Settings
 */
export async function autoTranslateSettings(settings: SiteSettings): Promise<SiteSettings> {
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
    workingHoursEn, workingHoursTr,
    navbarSubtitleEn, navbarSubtitleTr
  ] = await Promise.all([
    settings.firmNameAr ? translateText(settings.firmNameAr, 'en') : Promise.resolve(settings.firmNameEn || ''),
    settings.firmNameAr ? translateText(settings.firmNameAr, 'tr') : Promise.resolve(settings.firmNameTr || ''),
    settings.sloganAr ? translateText(settings.sloganAr, 'en') : Promise.resolve(settings.sloganEn || ''),
    settings.sloganAr ? translateText(settings.sloganAr, 'tr') : Promise.resolve(settings.sloganTr || ''),
    settings.subSloganAr ? translateText(settings.subSloganAr, 'en') : Promise.resolve(settings.subSloganEn || ''),
    settings.subSloganAr ? translateText(settings.subSloganAr, 'tr') : Promise.resolve(settings.subSloganTr || ''),
    settings.aboutHeadingAr ? translateText(settings.aboutHeadingAr, 'en') : Promise.resolve(settings.aboutHeadingEn || ''),
    settings.aboutHeadingAr ? translateText(settings.aboutHeadingAr, 'tr') : Promise.resolve(settings.aboutHeadingTr || ''),
    settings.aboutBadgeAr ? translateText(settings.aboutBadgeAr, 'en') : Promise.resolve(settings.aboutBadgeEn || ''),
    settings.aboutBadgeAr ? translateText(settings.aboutBadgeAr, 'tr') : Promise.resolve(settings.aboutBadgeTr || ''),
    settings.aboutTextAr ? translateText(settings.aboutTextAr, 'en') : Promise.resolve(settings.aboutTextEn || ''),
    settings.aboutTextAr ? translateText(settings.aboutTextAr, 'tr') : Promise.resolve(settings.aboutTextTr || ''),
    settings.aboutVisionAr ? translateText(settings.aboutVisionAr, 'en') : Promise.resolve(settings.aboutVisionEn || ''),
    settings.aboutVisionAr ? translateText(settings.aboutVisionAr, 'tr') : Promise.resolve(settings.aboutVisionTr || ''),
    settings.aboutMethodologyAr ? translateText(settings.aboutMethodologyAr, 'en') : Promise.resolve(settings.aboutMethodologyEn || ''),
    settings.aboutMethodologyAr ? translateText(settings.aboutMethodologyAr, 'tr') : Promise.resolve(settings.aboutMethodologyTr || ''),
    settings.aboutConfidentialityAr ? translateText(settings.aboutConfidentialityAr, 'en') : Promise.resolve(settings.aboutConfidentialityEn || ''),
    settings.aboutConfidentialityAr ? translateText(settings.aboutConfidentialityAr, 'tr') : Promise.resolve(settings.aboutConfidentialityTr || ''),
    settings.aboutVisionPoint1Ar ? translateText(settings.aboutVisionPoint1Ar, 'en') : Promise.resolve(settings.aboutVisionPoint1En || ''),
    settings.aboutVisionPoint1Ar ? translateText(settings.aboutVisionPoint1Ar, 'tr') : Promise.resolve(settings.aboutVisionPoint1Tr || ''),
    settings.aboutVisionPoint2Ar ? translateText(settings.aboutVisionPoint2Ar, 'en') : Promise.resolve(settings.aboutVisionPoint2En || ''),
    settings.aboutVisionPoint2Ar ? translateText(settings.aboutVisionPoint2Ar, 'tr') : Promise.resolve(settings.aboutVisionPoint2Tr || ''),
    settings.aboutMethodologyPoint1Ar ? translateText(settings.aboutMethodologyPoint1Ar, 'en') : Promise.resolve(settings.aboutMethodologyPoint1En || ''),
    settings.aboutMethodologyPoint1Ar ? translateText(settings.aboutMethodologyPoint1Ar, 'tr') : Promise.resolve(settings.aboutMethodologyPoint1Tr || ''),
    settings.aboutMethodologyPoint2Ar ? translateText(settings.aboutMethodologyPoint2Ar, 'en') : Promise.resolve(settings.aboutMethodologyPoint2En || ''),
    settings.aboutMethodologyPoint2Ar ? translateText(settings.aboutMethodologyPoint2Ar, 'tr') : Promise.resolve(settings.aboutMethodologyPoint2Tr || ''),
    settings.aboutConfidentialityPoint1Ar ? translateText(settings.aboutConfidentialityPoint1Ar, 'en') : Promise.resolve(settings.aboutConfidentialityPoint1En || ''),
    settings.aboutConfidentialityPoint1Ar ? translateText(settings.aboutConfidentialityPoint1Ar, 'tr') : Promise.resolve(settings.aboutConfidentialityPoint1Tr || ''),
    settings.aboutConfidentialityPoint2Ar ? translateText(settings.aboutConfidentialityPoint2Ar, 'en') : Promise.resolve(settings.aboutConfidentialityPoint2En || ''),
    settings.aboutConfidentialityPoint2Ar ? translateText(settings.aboutConfidentialityPoint2Ar, 'tr') : Promise.resolve(settings.aboutConfidentialityPoint2Tr || ''),
    settings.aboutRankingTitleAr ? translateText(settings.aboutRankingTitleAr, 'en') : Promise.resolve(settings.aboutRankingTitleEn || ''),
    settings.aboutRankingTitleAr ? translateText(settings.aboutRankingTitleAr, 'tr') : Promise.resolve(settings.aboutRankingTitleTr || ''),
    settings.aboutRankingDescAr ? translateText(settings.aboutRankingDescAr, 'en') : Promise.resolve(settings.aboutRankingDescEn || ''),
    settings.aboutRankingDescAr ? translateText(settings.aboutRankingDescAr, 'tr') : Promise.resolve(settings.aboutRankingDescTr || ''),
    settings.aboutCtaTextAr ? translateText(settings.aboutCtaTextAr, 'en') : Promise.resolve(settings.aboutCtaTextEn || ''),
    settings.aboutCtaTextAr ? translateText(settings.aboutCtaTextAr, 'tr') : Promise.resolve(settings.aboutCtaTextTr || ''),
    settings.addressAr ? translateText(settings.addressAr, 'en') : Promise.resolve(settings.addressEn || ''),
    settings.addressAr ? translateText(settings.addressAr, 'tr') : Promise.resolve(settings.addressTr || ''),
    settings.workingHoursAr ? translateText(settings.workingHoursAr, 'en') : Promise.resolve(settings.workingHoursEn || ''),
    settings.workingHoursAr ? translateText(settings.workingHoursAr, 'tr') : Promise.resolve(settings.workingHoursTr || ''),
    settings.navbarSubtitleAr ? translateText(settings.navbarSubtitleAr, 'en') : Promise.resolve(settings.navbarSubtitleEn || ''),
    settings.navbarSubtitleAr ? translateText(settings.navbarSubtitleAr, 'tr') : Promise.resolve(settings.navbarSubtitleTr || ''),
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
