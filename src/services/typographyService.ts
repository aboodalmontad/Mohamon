export interface FontDefinition {
  id: string;
  nameAr: string;
  nameEn: string;
  family: string;
  descriptionAr: string;
  descriptionEn: string;
  type: 'arabic' | 'latin' | 'serif' | 'sans';
  sampleTextAr?: string;
}

export const AVAILABLE_FONTS: FontDefinition[] = [
  {
    id: 'tajawal',
    nameAr: 'تجوال (Tajawal)',
    nameEn: 'Tajawal',
    family: "'Tajawal', sans-serif",
    descriptionAr: 'خط حديث ومريح جداً للقراءة الطويلة والمحتوى العام',
    descriptionEn: 'Modern, balanced and highly readable sans-serif',
    type: 'arabic',
    sampleTextAr: 'مكتب المحاماة والاستشارات القانونية والتحكيم التجاري الدولي'
  },
  {
    id: 'cairo',
    nameAr: 'كايرو (Cairo)',
    nameEn: 'Cairo',
    family: "'Cairo', sans-serif",
    descriptionAr: 'خط عصري قوي وواضح يعكس الطابع المؤسسي الاحترافي',
    descriptionEn: 'Bold and authoritative modern corporate typography',
    type: 'arabic',
    sampleTextAr: 'الريادة والعدل في صياغة العقود وتمثيل كبرى الشركات'
  },
  {
    id: 'amiri',
    nameAr: 'الأميري الملكي (Amiri)',
    nameEn: 'Amiri Classic',
    family: "'Amiri', 'Cormorant Garamond', serif",
    descriptionAr: 'خط عريق مستوحى من الطباعة الأميرية التاريخية، مثالي للهيبة القانونية',
    descriptionEn: 'Prestigious classical serif font inspired by royal press',
    type: 'serif',
    sampleTextAr: 'صوت العدالة وحماية الحقوق وصناعة الأحكام القضائية التاريخية'
  },
  {
    id: 'almarai',
    nameAr: 'المراعي (Almarai)',
    nameEn: 'Almarai',
    family: "'Almarai', sans-serif",
    descriptionAr: 'خط هندسي فائق النقاء والأناقة، مصمم للهيئات والشركات الراقية',
    descriptionEn: 'Geometric, ultra-clean and executive typography',
    type: 'arabic',
    sampleTextAr: 'حلول وقائية واستراتيجيات تفاوضية رائدة لقطاع الأعمال'
  },
  {
    id: 'elmessiri',
    nameAr: 'المسيري الفاخر (El Messiri)',
    nameEn: 'El Messiri',
    family: "'El Messiri', sans-serif",
    descriptionAr: 'خط مميز بلمسات فنية وفخامة استثنائية للعلامة والشعارات',
    descriptionEn: 'Distinguished, luxury curves tailored for premium branding',
    type: 'serif',
    sampleTextAr: 'خبرات ممتدة في فض النزاعات التجارية والتحكيم المؤسسي'
  },
  {
    id: 'notokufi',
    nameAr: 'الخط الكوفي المطور (Noto Kufi)',
    nameEn: 'Noto Kufi Arabic',
    family: "'Noto Kufi Arabic', sans-serif",
    descriptionAr: 'طابع كوفي هندسي رصين يجمع بين الأصالة العربية والحداثة',
    descriptionEn: 'Solid modern Kufic style combining tradition and precision',
    type: 'arabic',
    sampleTextAr: 'استشارات متقدمة في الاندماج والاستحواذ وأسواق المال'
  },
  {
    id: 'notonaskh',
    nameAr: 'خط النسخ المحقق (Noto Naskh)',
    nameEn: 'Noto Naskh Arabic',
    family: "'Noto Naskh Arabic', serif",
    descriptionAr: 'خط نسخي رسمي وواضح جداً يشبه صياغات اللوائح والمذكرات القانونية',
    descriptionEn: 'Official legal script with extreme clarity for clauses and briefs',
    type: 'serif',
    sampleTextAr: 'مذكرات دفاعية محكمة وصياغات قانونية دقيقة خالية من الثغرات'
  },
  {
    id: 'alexandria',
    nameAr: 'الإسكندرية (Alexandria)',
    nameEn: 'Alexandria',
    family: "'Alexandria', sans-serif",
    descriptionAr: 'خط عريض وجريء للترويسات والعناوين الرئيسية الضخمة',
    descriptionEn: 'Contemporary, high-impact font for prominent headlines',
    type: 'arabic',
    sampleTextAr: 'مكتب المحاماة الأول للكيانات الاستثمارية والشركات القابضة'
  },
  {
    id: 'readex',
    nameAr: 'ريدكس برو (Readex Pro)',
    nameEn: 'Readex Pro',
    family: "'Readex Pro', sans-serif",
    descriptionAr: 'خط تكنولوجي انسيابي ناعم الزوايا ومريح للأجهزة الرقمية',
    descriptionEn: 'Streamlined, digital-first font with soft modern geometry',
    type: 'arabic',
    sampleTextAr: 'منظومة قانونية رقمية متكاملة لخدمة العملاء على مدار الساعة'
  },
  {
    id: 'cormorant',
    nameAr: 'كورمورانت جاراموند (Cormorant Garamond)',
    nameEn: 'Cormorant Garamond',
    family: "'Cormorant Garamond', 'Amiri', serif",
    descriptionAr: 'خط لاتيني ملكي فاخر للعناوين والأسماء الإنجليزية',
    descriptionEn: 'High-luxury classical serif suited for prestigious law firms',
    type: 'latin',
    sampleTextAr: 'Elite Legal Counsel & International Arbitration'
  },
  {
    id: 'playfair',
    nameAr: 'بلايفير ديسبلاي (Playfair Display)',
    nameEn: 'Playfair Display',
    family: "'Playfair Display', serif",
    descriptionAr: 'خط لاتيني كلاسيكي عريض يضفي فخامة استثنائية',
    descriptionEn: 'High-contrast editorial serif for bold luxury statements',
    type: 'latin',
    sampleTextAr: 'Excellence in Jurisprudence & Global Litigation'
  },
  {
    id: 'cinzel',
    nameAr: 'سينزل الروماني (Cinzel)',
    nameEn: 'Cinzel Classic',
    family: "'Cinzel', serif",
    descriptionAr: 'مستوحى من النقوش الرومانية التاريخية لموازين وقصور العدالة',
    descriptionEn: 'Roman-inscribed classical styling for judicial heritage',
    type: 'latin',
    sampleTextAr: 'JUSTICE, INTEGRITY & ADVOCACY'
  },
  {
    id: 'inter',
    nameAr: 'إنتر العالمي (Inter)',
    nameEn: 'Inter',
    family: "'Inter', sans-serif",
    descriptionAr: 'أفضل خط عالمي للواجهات الرقمية والأرقام والبيانات الإحصائية',
    descriptionEn: 'World standard UI typography for precision and data tables',
    type: 'latin',
    sampleTextAr: 'Global Corporate Law & Cross-Border Transactions'
  },
];

export const getFontFamilyValue = (fontId?: string, fallback: string = "'Tajawal', sans-serif"): string => {
  if (!fontId) return fallback;
  const found = AVAILABLE_FONTS.find(f => f.id === fontId.toLowerCase());
  return found ? found.family : fallback;
};

export const applyTypographySettings = (settings: {
  fontFamilyBody?: string;
  fontFamilyHeadings?: string;
  fontFamilyFirmName?: string;
  fontFamilyHeroHeadline?: string;
  fontFamilyNavbar?: string;
  fontFamilyCards?: string;
}) => {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const bodyFont = getFontFamilyValue(settings.fontFamilyBody, "'Tajawal', sans-serif");
  const headingsFont = getFontFamilyValue(settings.fontFamilyHeadings, "'Amiri', 'Cormorant Garamond', serif");
  const firmNameFont = getFontFamilyValue(settings.fontFamilyFirmName, headingsFont);
  const heroHeadlineFont = getFontFamilyValue(settings.fontFamilyHeroHeadline, headingsFont);
  const navbarFont = getFontFamilyValue(settings.fontFamilyNavbar, bodyFont);
  const cardsFont = getFontFamilyValue(settings.fontFamilyCards, bodyFont);

  root.style.setProperty('--font-body', bodyFont);
  root.style.setProperty('--font-headings', headingsFont);
  root.style.setProperty('--font-firm-name', firmNameFont);
  root.style.setProperty('--font-hero-headline', heroHeadlineFont);
  root.style.setProperty('--font-navbar', navbarFont);
  root.style.setProperty('--font-cards', cardsFont);
};
