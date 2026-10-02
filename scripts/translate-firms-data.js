import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const cache = new Map();

function hasArabic(text) {
  return /[\u0600-\u06FF]/.test(text || '');
}

const DICT = {
  'المحامي أحمد بدوي': { en: 'Attorney Ahmad Badawi', tr: 'Avukat Ahmed Bedevi' },
  'أحمد بدوي': { en: 'Ahmad Badawi', tr: 'Ahmed Bedevi' },
  'المحامي محمد زين': { en: 'Attorney Mohammed Zein', tr: 'Avukat Muhammed Zeyn' },
  'محمد زين': { en: 'Mohammed Zein', tr: 'Muhammed Zeyn' },
  'شورى  للمحاماة والاستشارات القانونية': { en: 'Shura Law Firm & Legal Consultations', tr: 'Şura Hukuk Bürosu ve Hukuki Danışmanlık' },
  'شورى للمحاماة والاستشارات القانونية': { en: 'Shura Law Firm & Legal Consultations', tr: 'Şura Hukuk Bürosu ve Hukuki Danışmanlık' },
  'شركة شورى للمحاماة': { en: 'Shura Law Firm', tr: 'Şura Hukuk Bürosu' },
  'المحامي عبد الرحمن نحوي': { en: 'Attorney Abdul Rahman Nahwi', tr: 'Avukat Abdurrahman Nahvi' },
  'عبد الرحمن نحوي': { en: 'Abdul Rahman Nahwi', tr: 'Abdurrahman Nahvi' },
  'مكتب المحامي أحمد جعفر': { en: 'Law Office of Attorney Ahmad Jaafar', tr: 'Avukat Ahmed Cafer Hukuk Bürosu' },
  'المحامي أحمد جعفر': { en: 'Attorney Ahmad Jaafar', tr: 'Avukat Ahmed Cafer' },
  'أحمد جعفر': { en: 'Ahmad Jaafar', tr: 'Ahmed Cafer' },
  'احمد نداف': { en: 'Ahmad Nadaf', tr: 'Ahmed Neddaf' },
  'المحامي أحمد نداف': { en: 'Attorney Ahmad Nadaf', tr: 'Avukat Ahmed Neddaf' },
  'المحامي محمد بركات': { en: 'Attorney Mohammed Barakat', tr: 'Avukat Muhammed Berekat' },
  'محمد بركات': { en: 'Mohammed Barakat', tr: 'Muhammed Berekat' },
  'د. عبد الرحمن بن منصور آل هلال': { en: 'Dr. Abdulrahman Al-Helal', tr: 'Dr. Abdurrahman El-Hilal' },
  'أ. د. نورة بنت فهد الهاشمي': { en: 'Prof. Dr. Noura Fahad Al-Hashemi', tr: 'Prof. Dr. Nura bint Fehd El-Haşimi' },
  'المستشار طارق بن إبراهيم السعدي': { en: 'Counselor Tariq Ibrahim Al-Saadi', tr: 'Hukuk Müşaviri Tarık bin İbrahim Es-Saadi' },
  'د. فيصل بن خالد القحطاني': { en: 'Dr. Faisal Khalid Al-Qahtani', tr: 'Dr. Faysal bin Halid El-Kahtani' },
  'أ. سارة بنت عبد العزيز المنصور': { en: 'Sarah Abdulaziz Al-Mansour', tr: 'Sara bint Abdülaziz El-Mansur' },
  'المستشار كريم بن حاتم التميمي': { en: 'Counselor Karim Hatem Al-Tamimi', tr: 'Hukuk Müşaviri Kerim bin Hatim Et-Temimi' },
  'المحامي يوسف نيرباني': { en: 'Attorney Youssef Nairbani', tr: 'Avukat Yusuf Neyrebani' },
  'المحامي يوسف نيرباني ': { en: 'Attorney Youssef Nairbani', tr: 'Avukat Yusuf Neyrebani' },
  'شريك مؤسس في شركة شورى للمحاماة': { en: 'Founding Partner at Shura Law Firm', tr: 'Şura Hukuk Bürosu Kurucu Ortağı' },
  'شريك مؤسس في شركة شورى للمحاماة ': { en: 'Founding Partner at Shura Law Firm', tr: 'Şura Hukuk Bürosu Kurucu Ortağı' },
  'محامٍ ومستشار قانوني': { en: 'Attorney at Law & Legal Consultant', tr: 'Avukat ve Hukuk Danışmanı' },
  'محامٍ أستاذ معتمد': { en: 'Certified Senior Advocate', tr: 'Kıdemli Ruhsatlı Avukat' },
  'محامٍ متدرب وباحث قانوني': { en: 'Trainee Lawyer & Legal Researcher', tr: 'Stajyer Avukat ve Hukuk Araştırmacısı' },
  'الاستشارات القانونية والتقاضي': { en: 'Legal Consultations & Litigation', tr: 'Hukuki Danışmanlık ve Dava Takibi' },
  'التقاضي التجاري والعمالي وصياغة المذكرات': { en: 'Commercial & Labor Litigation & Contract Drafting', tr: 'Ticari ve İş Davaları Temsili ve Sözleşme Tanzimi' },
  'القضايا الجمركية': { en: 'Customs & Foreign Trade Litigation', tr: 'Gümrük ve Dış Ticaret Uyuşmazlıkları' },
  'القضايا المدنية - الشرعية': { en: 'Civil & Personal Status Litigation', tr: 'Medeni ve Aile Hukuku Davaları' },
  'الدعاوى الجنائية': { en: 'Criminal Defense & Litigation', tr: 'Ceza Davaları ve Savunma' },
  'الدعاوى الجنائية ': { en: 'Criminal Defense & Litigation', tr: 'Ceza Davaları ve Savunma' },
  'القضايا الجنائية': { en: 'Criminal Defense & Litigation', tr: 'Ceza Davaları ve Savunma' },
  'القضايا الجنائية ': { en: 'Criminal Defense & Litigation', tr: 'Ceza Davaları ve Savunma' },
  'الدعاوى الشرعية': { en: 'Personal Status & Family Law', tr: 'Aile ve Miras Hukuku Davaları' },
  'العقارات والمشاريع الإنشائية .': { en: 'Real Estate & Mega Construction Projects', tr: 'Gayrimenkul ve İnşaat Projeleri Hukuku' },
  'العقارات والمشاريع الإنشائية': { en: 'Real Estate & Mega Construction Projects', tr: 'Gayrimenkul ve İnşaat Projeleri Hukuku' },
  'التقاضي والمرافعة أمام المحاكم السورية': { en: 'Litigation & Advocacy before Syrian Courts', tr: 'Suriye Mahkemelerinde Dava ve Temsil' },
  'قانون الشركات، الاستحواذ والاندماج وحوكمة الكيانات': { en: 'Corporate Law, M&A and Governance', tr: 'Şirketler Hukuku, M&A ve Kurumsal Yönetişim' },
  'قانون الشركات، الاندماج والاستحواذ': { en: 'Corporate Law, Mergers & Acquisitions', tr: 'Şirketler Hukuku, Birleşme ve Devralmalar' },
  'التحكيم التجاري والنزاعات الدولية': { en: 'Commercial Arbitration & International Disputes', tr: 'Ticari Tahkim ve Uluslararası Uyuşmazlıklar' },
  'التقاضي والمرافعة أمام المحاكم العليا': { en: 'Supreme Court Trial Advocacy & Appellate Litigation', tr: 'Yüksek Mahkemelerde Dava ve Temsil' },
  'الملكية الفكرية والذكاء الاصطناعي والتقنية': { en: 'Intellectual Property, AI & Technology Law', tr: 'Fikri Mülkiyet, Yapay Zekâ ve Teknoloji Hukuku' },
  'التمويل المصرفي والأسواق المالية': { en: 'Banking Finance & Capital Markets', tr: 'Banka Finansmanı ve Sermaye Piyasaları' },
  'نقابة المحامين في الجمهورية العربية السورية -فرع حلب ': { en: 'Syrian Bar Association - Aleppo Branch', tr: 'Suriye Barolar Birliği - Halep Şubesi' },
  'نقابة المحامين في الجمهورية العربية السورية -فرع حلب': { en: 'Syrian Bar Association - Aleppo Branch', tr: 'Suriye Barolar Birliği - Halep Şubesi' },
  'نقابة المحامين في الجمهورية العربية السورية - فرع حلب': { en: 'Syrian Bar Association - Aleppo Branch', tr: 'Suriye Barolar Birliği - Halep Şubesi' },
  'عضو في نقابة المحامين في سورية -فرع حلب': { en: 'Member of the Syrian Bar Association - Aleppo Branch', tr: 'Suriye Barolar Birliği Üyesi - Halep Şubesi' },
  'الهيئة السعودية للمحامين (رخصة محامٍ ممارس)': { en: 'Saudi Bar Association (Licensed Practicing Attorney)', tr: 'Suudi Arabistan Barolar Birliği (Ruhsatlı Avukat)' },
  'ترخيص استشارات قانونية / تحكيم': { en: 'Legal Consultancy & Commercial Arbitration License', tr: 'Hukuki Danışmanlık ve Ticari Tahkim Lisansı' },
  'الرياض': { en: 'Riyadh', tr: 'Riyad' },
  'حلب': { en: 'Aleppo', tr: 'Halep' },
  'دمشق': { en: 'Damascus', tr: 'Şam' },
  'حلب بوابة القصب': { en: 'Aleppo, Bab Al-Qasab', tr: 'Halep, Kasap Kapısı' },
  'حماية حقوقكم، أولويتنا وصناعة ريادتكم القانونية': { en: 'Safeguarding Your Rights, Pioneering Your Legal Success', tr: 'Haklarınızı Korumak Önceliğimiz, Hukuki Liderliğinizi İnşa Etmek Görevimizdir' },
  'الباقة السنوية القياسية': { en: 'Standard Annual Plan', tr: 'Standart Yıllık Plan' },
  'الباقة السنوية الاحترافية': { en: 'Professional Annual Plan', tr: 'Profesyonel Yıllık Plan' },
  'الباقة الماسية الشاملة': { en: 'Comprehensive Diamond Plan', tr: 'Kapsamlı Elmas Plan' },
  'إجازة في الحقوق من جامعة حلب': { en: 'Bachelor of Laws (LL.B.) - University of Aleppo', tr: 'Halep Üniversitesi Hukuk Fakültesi Lisans Derecesi (LL.B.)' },
  'إجازة في الحقوق - جامعة دمشق': { en: 'Bachelor of Laws (LL.B.) - Damascus University', tr: 'Şam Üniversitesi Hukuk Fakültesi Lisans Derecesi (LL.B.)' },
  'محكم معتمد من نقابة المحامين في سورية': { en: 'Accredited Arbitrator by the Syrian Bar Association', tr: 'Suriye Barolar Birliği Akredite Hakemi' },
};

async function fetchMyMemory(text, targetLang) {
  const trimmed = text.trim();
  if (!trimmed) return '';
  if (!hasArabic(trimmed)) return trimmed;

  if (DICT[trimmed] && DICT[trimmed][targetLang]) {
    return DICT[trimmed][targetLang];
  }

  const cacheKey = `${targetLang}:${trimmed}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=ar|${targetLang}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const trans = data?.responseData?.translatedText;
      if (trans && typeof trans === 'string' && !hasArabic(trans)) {
        cache.set(cacheKey, trans.trim());
        return trans.trim();
      }
    }
  } catch (err) {
    // ignore
  }

  return '';
}

async function translateString(text, targetLang, existing) {
  if (existing && typeof existing === 'string' && existing.trim() !== '' && !hasArabic(existing)) {
    return existing.trim();
  }
  if (!text || typeof text !== 'string' || text.trim() === '') return '';
  const trimmed = text.trim();
  if (!hasArabic(trimmed)) return trimmed;

  if (DICT[trimmed] && DICT[trimmed][targetLang]) {
    return DICT[trimmed][targetLang];
  }

  const apiTrans = await fetchMyMemory(trimmed, targetLang);
  if (apiTrans && !hasArabic(apiTrans)) return apiTrans;

  // Fallback transliteration
  return transliterateArabic(trimmed, targetLang);
}

function transliterateArabic(text, targetLang) {
  let s = text;
  for (const [ar, obj] of Object.entries(DICT)) {
    if (s.includes(ar)) {
      s = s.split(ar).join(obj[targetLang] || obj.en);
    }
  }
  if (!hasArabic(s)) return s;

  // Letter by letter transliteration
  const charMap = {
    'ا': 'a', 'أ': 'a', 'إ': 'e', 'آ': 'aa', 'ء': "'", 'ى': 'a', 'ة': 'ah',
    'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': targetLang === 'tr' ? 'c' : 'j',
    'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'dh', 'ر': 'r', 'ز': 'z',
    'س': 's', 'ش': targetLang === 'tr' ? 'ş' : 'sh', 'ص': 's', 'ض': 'd',
    'ط': 't', 'ظ': 'z', 'ع': 'a', 'غ': 'gh', 'ف': 'f', 'ق': 'q',
    'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n', 'ه': 'h', 'و': 'w', 'ي': 'y',
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
  };

  let out = '';
  for (const ch of s) {
    out += charMap[ch] !== undefined ? charMap[ch] : ch;
  }
  return out.replace(/\s+/g, ' ').trim();
}

async function translateAllFirms() {
  const firmsPath = path.join(rootDir, 'public', 'firms_data.json');
  const siteDataPath = path.join(rootDir, 'public', 'site_data.json');
  if (!fs.existsSync(firmsPath)) {
    console.error('firms_data.json not found');
    return;
  }

  const firms = JSON.parse(fs.readFileSync(firmsPath, 'utf8'));
  console.log(`Starting comprehensive translation for ${firms.length} firms...`);

  for (let i = 0; i < firms.length; i++) {
    const f = firms[i];
    console.log(`[${i + 1}/${firms.length}] Translating firm: ${f.nameAr} (${f.slug})...`);

    f.nameEn = await translateString(f.nameAr, 'en', f.nameEn);
    f.nameTr = await translateString(f.nameAr, 'tr', f.nameTr);
    f.taglineEn = await translateString(f.taglineAr, 'en', f.taglineEn);
    f.taglineTr = await translateString(f.taglineAr, 'tr', f.taglineTr);
    f.cityEn = await translateString(f.cityAr, 'en', f.cityEn);
    f.cityTr = await translateString(f.cityAr, 'tr', f.cityTr);

    const d = f.data || {};
    const s = d.settings || {};

    s.firmNameEn = await translateString(s.firmNameAr || f.nameAr, 'en', s.firmNameEn);
    s.firmNameTr = await translateString(s.firmNameAr || f.nameAr, 'tr', s.firmNameTr);
    s.sloganEn = await translateString(s.sloganAr || f.taglineAr, 'en', s.sloganEn);
    s.sloganTr = await translateString(s.sloganAr || f.taglineAr, 'tr', s.sloganTr);
    s.subSloganEn = await translateString(s.subSloganAr, 'en', s.subSloganEn);
    s.subSloganTr = await translateString(s.subSloganAr, 'tr', s.subSloganTr);
    s.aboutTextEn = await translateString(s.aboutTextAr, 'en', s.aboutTextEn);
    s.aboutTextTr = await translateString(s.aboutTextAr, 'tr', s.aboutTextTr);
    s.aboutHeadingEn = await translateString(s.aboutHeadingAr, 'en', s.aboutHeadingEn);
    s.aboutHeadingTr = await translateString(s.aboutHeadingAr, 'tr', s.aboutHeadingTr);
    s.aboutBadgeEn = await translateString(s.aboutBadgeAr, 'en', s.aboutBadgeEn);
    s.aboutBadgeTr = await translateString(s.aboutBadgeAr, 'tr', s.aboutBadgeTr);
    s.addressEn = await translateString(s.addressAr, 'en', s.addressEn);
    s.addressTr = await translateString(s.addressAr, 'tr', s.addressTr);
    s.cityEn = await translateString(s.cityAr, 'en', s.cityEn);
    s.cityTr = await translateString(s.cityAr, 'tr', s.cityTr);
    s.workingHoursEn = await translateString(s.workingHoursAr, 'en', s.workingHoursEn);
    s.workingHoursTr = await translateString(s.workingHoursAr, 'tr', s.workingHoursTr);

    // Partners
    if (Array.isArray(d.partners)) {
      for (const p of d.partners) {
        p.nameEn = await translateString(p.name, 'en', p.nameEn);
        p.nameTr = await translateString(p.name, 'tr', p.nameTr);
        p.titleEn = await translateString(p.title, 'en', p.titleEn);
        p.titleTr = await translateString(p.title, 'tr', p.titleTr);
        p.specialtyEn = await translateString(p.specialty, 'en', p.specialtyEn);
        p.specialtyTr = await translateString(p.specialty, 'tr', p.specialtyTr);
        p.bioEn = await translateString(p.bio, 'en', p.bioEn);
        p.bioTr = await translateString(p.bio, 'tr', p.bioTr);
        p.barAdmissionEn = await translateString(p.barAdmission, 'en', p.barAdmissionEn);
        p.barAdmissionTr = await translateString(p.barAdmission, 'tr', p.barAdmissionTr);

        if (Array.isArray(p.education)) {
          p.educationEn = p.educationEn || [];
          p.educationTr = p.educationTr || [];
          for (let edIdx = 0; edIdx < p.education.length; edIdx++) {
            const ed = p.education[edIdx];
            p.educationEn[edIdx] = await translateString(ed, 'en', p.educationEn[edIdx]);
            p.educationTr[edIdx] = await translateString(ed, 'tr', p.educationTr[edIdx]);
          }
        }
      }
    }

    // Practice Areas
    if (Array.isArray(d.practiceAreas)) {
      for (const pa of d.practiceAreas) {
        pa.titleEn = await translateString(pa.titleAr || pa.title, 'en', pa.titleEn);
        pa.titleTr = await translateString(pa.titleAr || pa.title, 'tr', pa.titleTr);
        pa.shortDescEn = await translateString(pa.shortDescAr || pa.shortDesc, 'en', pa.shortDescEn);
        pa.shortDescTr = await translateString(pa.shortDescAr || pa.shortDesc, 'tr', pa.shortDescTr);
        pa.fullDescEn = await translateString(pa.fullDescAr || pa.fullDesc, 'en', pa.fullDescEn);
        pa.fullDescTr = await translateString(pa.fullDescAr || pa.fullDesc, 'tr', pa.fullDescTr);

        if (Array.isArray(pa.features)) {
          pa.featuresEn = pa.featuresEn || [];
          pa.featuresTr = pa.featuresTr || [];
          for (let fIdx = 0; fIdx < pa.features.length; fIdx++) {
            pa.featuresEn[fIdx] = await translateString(pa.features[fIdx], 'en', pa.featuresEn[fIdx]);
            pa.featuresTr[fIdx] = await translateString(pa.features[fIdx], 'tr', pa.featuresTr[fIdx]);
          }
        }
      }
    }

    // Case Studies
    if (Array.isArray(d.caseStudies)) {
      for (const cs of d.caseStudies) {
        cs.titleEn = await translateString(cs.title, 'en', cs.titleEn);
        cs.titleTr = await translateString(cs.title, 'tr', cs.titleTr);
        cs.clientTypeEn = await translateString(cs.clientType, 'en', cs.clientTypeEn);
        cs.clientTypeTr = await translateString(cs.clientType, 'tr', cs.clientTypeTr);
        cs.outcomeEn = await translateString(cs.outcome, 'en', cs.outcomeEn);
        cs.outcomeTr = await translateString(cs.outcome, 'tr', cs.outcomeTr);
      }
    }

    // Testimonials
    if (Array.isArray(d.testimonials)) {
      for (const t of d.testimonials) {
        t.authorEn = await translateString(t.author, 'en', t.authorEn);
        t.authorTr = await translateString(t.author, 'tr', t.authorTr);
        t.roleEn = await translateString(t.role, 'en', t.roleEn);
        t.roleTr = await translateString(t.role, 'tr', t.roleTr);
        t.companyEn = await translateString(t.company, 'en', t.companyEn);
        t.companyTr = await translateString(t.company, 'tr', t.companyTr);
        t.contentEn = await translateString(t.content, 'en', t.contentEn);
        t.contentTr = await translateString(t.content, 'tr', t.contentTr);
      }
    }

    // Blog Posts
    if (Array.isArray(d.blogPosts)) {
      for (const b of d.blogPosts) {
        b.titleEn = await translateString(b.title, 'en', b.titleEn);
        b.titleTr = await translateString(b.title, 'tr', b.titleTr);
        b.excerptEn = await translateString(b.excerpt, 'en', b.excerptEn);
        b.excerptTr = await translateString(b.excerpt, 'tr', b.excerptTr);
        b.contentEn = await translateString(b.content, 'en', b.contentEn);
        b.contentTr = await translateString(b.content, 'tr', b.contentTr);
      }
    }

    // Offices
    if (Array.isArray(d.offices)) {
      for (const o of d.offices) {
        o.nameEn = await translateString(o.name, 'en', o.nameEn);
        o.nameTr = await translateString(o.name, 'tr', o.nameTr);
        o.addressEn = await translateString(o.address, 'en', o.addressEn);
        o.addressTr = await translateString(o.address, 'tr', o.addressTr);
        o.cityEn = await translateString(o.cityAr || o.name, 'en', o.cityEn);
        o.cityTr = await translateString(o.cityAr || o.name, 'tr', o.cityTr);
        o.workingHoursEn = await translateString(o.workingHours, 'en', o.workingHoursEn);
        o.workingHoursTr = await translateString(o.workingHours, 'tr', o.workingHoursTr);
      }
    }

    f.data = d;
  }

  fs.writeFileSync(firmsPath, JSON.stringify(firms, null, 2), 'utf8');
  console.log(`Successfully updated ${firmsPath}`);

  // Also update site_data.json
  const defaultFirm = firms.find(f => f.isDefaultPublic) || firms.find(f => f.slug === 'shwra-llmhamah-walastsharat-alqanwnyh') || firms[0];
  if (defaultFirm && defaultFirm.data) {
    const siteData = {
      settings: defaultFirm.data.settings,
      partners: defaultFirm.data.partners,
      practiceAreas: defaultFirm.data.practiceAreas,
      testimonials: defaultFirm.data.testimonials,
      blogPosts: defaultFirm.data.blogPosts,
      caseStudies: defaultFirm.data.caseStudies,
      offices: defaultFirm.data.offices,
      messages: defaultFirm.data.messages || [],
      exportedAt: new Date().toISOString()
    };
    fs.writeFileSync(siteDataPath, JSON.stringify(siteData, null, 2), 'utf8');
    console.log(`Successfully updated ${siteDataPath}`);
  }
}

translateAllFirms().catch(console.error);
