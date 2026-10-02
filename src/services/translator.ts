import { 
  Partner, PracticeArea, Testimonial, BlogPost, CaseStudy, SiteSettings, OfficeLocation, WhyChooseUsPillar 
} from '../types';

// Legal domain dictionary for instant offline high-precision translation
export const LEGAL_GLOSSARY: Record<string, { en: string; tr: string }> = {
  // Roles & Titles
  'شريك مؤسس ومدير تنفيذي': { en: 'Founding Partner & Managing Director', tr: 'Kurucu Ortak ve Yönetici Direktör' },
  'شريك رئيسي ورئيس قسم التحكيم والنزاعات': { en: 'Senior Partner & Head of Arbitration and Disputes', tr: 'Kıdemli Ortak ve Tahkim ve Uyuşmazlıklar Bölüm Başkanı' },
  'شريك ورئيس قسم الشركات والاستحواذ': { en: 'Partner & Head of Corporate and M&A', tr: 'Ortak ve Şirketler Hukuku ve M&A Başkanı' },
  'شريك - قسم الملكية الفكرية والذكاء الاصطناعي': { en: 'Partner - Intellectual Property & AI Law', tr: 'Ortak - Fikri Mülkiyet ve Yapay Zekâ Hukuku' },
  'محامٍ مشارك أول - قسم التقاضي والعقود': { en: 'Senior Associate Attorney - Litigation & Commercial Contracts', tr: 'Kıdemli Avukat - Dava ve Ticari Sözleşmeler' },
  'مستشار قانوني أول': { en: 'Senior Legal Counsel & Regulatory Advisor', tr: 'Kıdemli Hukuk Müşaviri ve Regülasyon Danışmanı' },
  'محامٍ ممارس': { en: 'Practicing Attorney', tr: 'Ruhsatlı Avukat' },
  'مستشار قانوني': { en: 'Legal Consultant', tr: 'Hukuk Danışmanı' },
  'محامٍ ومستشار قانوني': { en: 'Attorney at Law & Legal Consultant', tr: 'Avukat ve Hukuk Danışmanı' },
  'محامٍ بالنقض ومحكّم معتمد': { en: 'Supreme Court Advocate & Accredited Arbitrator', tr: 'Yargıtay Avukatı ve Akredite Hakem' },
  'المؤسس والمدير التنفيذي': { en: 'Founder & Managing Partner', tr: 'Kurucu ve Yönetici Ortak' },
  'مؤسس ومدير مكتب المحاماة': { en: 'Founder & Managing Director of the Law Firm', tr: 'Hukuk Bürosu Kurucusu ve Yönetici Direktörü' },
  'شريك مؤسس': { en: 'Founding Partner', tr: 'Kurucu Ortak' },
  'شريك إداري': { en: 'Managing Partner', tr: 'Yönetici Ortak' },
  'محامي متدرب': { en: 'Trainee Lawyer', tr: 'Stajyer Avukat' },
  'محامون ومستشارون قانونيون ومحكّمون': { en: 'Attorneys, Legal Counsel & Arbitrators', tr: 'Avukatlar, Hukuk Müşavirleri ve Uluslararası Hakemler' },

  // Specialties
  'التحكيم الدولي والنزاعات التجارية الكبرى': { en: 'International Arbitration & High-Stakes Commercial Disputes', tr: 'Uluslararası Tahkim ve Yüksek Meblağlı Ticari Davalar' },
  'الاندماج والاستحواذ وهيكلة الاستثمارات الأجنبية': { en: 'M&A and Cross-Border Foreign Investment Structuring', tr: 'Birleşme ve Devralmalar (M&A) ve Uluslararası Yatırım Yapılandırma' },
  'التمويل المصرفي والأسواق المالية وأدوات الدين': { en: 'Banking & Project Finance, Capital Markets & Sukuk', tr: 'Banka ve Proje Finansmanı, Sermaye Piyasaları ve Tahvil' },
  'الملكية الفكرية وبراءات الاختراع وتشريعات التقنية': { en: 'Intellectual Property, Patents & Emerging Tech Law', tr: 'Fikri Mülkiyet, Patentler ve Yeni Nesil Teknoloji Hukuku' },
  'التقاضي التجاري والعمالي وصياغة المذكرات': { en: 'Commercial Litigation & Contract Drafting', tr: 'Ticari ve İş Davaları Temsili ve Sözleşme Tanzimi' },
  'الاستشارات التنظيمية والتحكيم والامتثال': { en: 'Regulatory Compliance & International Arbitration', tr: 'Regülasyon Uyumu ve Uluslararası Tahkim Danışmanlığı' },
  'القضايا المدنية والتجارية والعقارية والجزائية والتحكيم': { en: 'Civil, Commercial, Real Estate, Criminal Litigation & Arbitration', tr: 'Medeni, Ticari, Gayrimenkul, Ceza Davaları ve Tahkim' },
  'القانون التجاري والمدني والتحكيم': { en: 'Commercial, Civil Law & Arbitration', tr: 'Ticaret, Medeni Hukuk ve Tahkim' },
  'القضايا الجزائية والمدنية والعقارية': { en: 'Criminal, Civil & Real Estate Litigation', tr: 'Ceza, Medeni ve Gayrimenkul Davaları' },

  // Bar admissions & Credentials
  'الهيئة السعودية للمحامين (رخصة محامٍ ممارس)': { en: 'Saudi Bar Association (Licensed Practicing Attorney)', tr: 'Suudi Arabistan Barolar Birliği (Ruhsatlı Avukat)' },
  'ترخيص استشارات قانونية / تحكيم': { en: 'Legal Consultancy & Commercial Arbitration License', tr: 'Hukuki Danışmanlık ve Ticari Tahkim Lisansı' },
  'نقابة المحامين في الجمهورية العربية السورية': { en: 'Syrian Bar Association (Syrian Arab Republic)', tr: 'Suriye Arap Cumhuriyeti Barolar Birliği' },
  'نقابة المحامين في الجمهورية العربية السورية - فرع حلب': { en: 'Syrian Bar Association - Aleppo Branch', tr: 'Suriye Barolar Birliği - Halep Şubesi' },
  'نقابة المحامين في الجمهورية العربية السورية -فرع حلب': { en: 'Syrian Bar Association - Aleppo Branch', tr: 'Suriye Barolar Birliği - Halep Şubesi' },
  'نقابة المحامين في الجمهورية العربية السورية - فرع دمشق': { en: 'Syrian Bar Association - Damascus Branch', tr: 'Suriye Barolar Birliği - Şam Şubesi' },
  'نقابة المحامين في الجمهورية العربية السورية - فرع ريف دمشق': { en: 'Syrian Bar Association - Rif Dimashq Branch', tr: 'Suriye Barolar Birliği - Şam Kırsalı Şubesi' },
  'نقابة المحامين في الجمهورية العربية السورية - فرع حمص': { en: 'Syrian Bar Association - Homs Branch', tr: 'Suriye Barolar Birliği - Humus Şubesi' },
  'نقابة المحامين في الجمهورية العربية السورية - فرع حماة': { en: 'Syrian Bar Association - Hama Branch', tr: 'Suriye Barolar Birliği - Hama Şubesi' },
  'نقابة المحامين في الجمهورية العربية السورية - فرع اللاذقية': { en: 'Syrian Bar Association - Latakia Branch', tr: 'Suriye Barolar Birliği - Lazkiye Şubesi' },
  'نقابة المحامين في الجمهورية العربية السورية - فرع طرطوس': { en: 'Syrian Bar Association - Tartus Branch', tr: 'Suriye Barolar Birliği - Tartus Şubesi' },
  'نقابة المحامين في الجمهورية العربية السورية - فرع إدلب': { en: 'Syrian Bar Association - Idlib Branch', tr: 'Suriye Barolar Birliği - İdlib Şubesi' },
  'محكم معتمد من نقابة المحامين في سورية': { en: 'Accredited Arbitrator by the Syrian Bar Association', tr: 'Suriye Barolar Birliği Akredite Hakemi' },
  'أستاذ في القانون - محكم معتمد لدى وزارة العدل في الجمهورية العربية السورية': { en: 'Master of Laws - Accredited Arbitrator at the Syrian Ministry of Justice', tr: 'Hukuk Üstadı - Suriye Adalet Bakanlığı Akredite Hakemi' },
  'إجازة في الحقوق من جامعة حلب': { en: 'Bachelor of Laws (LL.B.) - University of Aleppo', tr: 'Halep Üniversitesi Hukuk Fakültesi Lisans Derecesi (LL.B.)' },
  'إجازة في الحقوق - جامعة دمشق': { en: 'Bachelor of Laws (LL.B.) - Damascus University', tr: 'Şam Üniversitesi Hukuk Fakültesi Lisans Derecesi (LL.B.)' },

  // Cities & Countries
  'الرياض': { en: 'Riyadh', tr: 'Riyad' },
  'جدة': { en: 'Jeddah', tr: 'Cidde' },
  'الدمام': { en: 'Dammam', tr: 'Dammam' },
  'الخبر': { en: 'Al Khobar', tr: 'El-Huber' },
  'مكة المكرمة': { en: 'Makkah', tr: 'Mekke' },
  'المدينة المنورة': { en: 'Madinah', tr: 'Medine' },
  'حلب': { en: 'Aleppo', tr: 'Halep' },
  'دمشق': { en: 'Damascus', tr: 'Şam' },
  'حمص': { en: 'Homs', tr: 'Humus' },
  'حماة': { en: 'Hama', tr: 'Hama' },
  'اللاذقية': { en: 'Latakia', tr: 'Lazkiye' },
  'طرطوس': { en: 'Tartus', tr: 'Tartus' },
  'إدلب': { en: 'Idlib', tr: 'İdlib' },
  'درعا': { en: 'Daraa', tr: 'Dera' },
  'دير الزور': { en: 'Deir ez-Zor', tr: 'Deyrizor' },
  'الحسكة': { en: 'Al-Hasakah', tr: 'Haseke' },
  'الرقة': { en: 'Raqqa', tr: 'Rakka' },
  'السويداء': { en: 'As-Suwayda', tr: 'Süveyda' },
  'الجزائر': { en: 'Algeria', tr: 'Cezayir' },
  'الجزائر العاصمة': { en: 'Algiers', tr: 'Cezayir' },
  'وهران': { en: 'Oran', tr: 'Oran' },
  'قسنطينة': { en: 'Constantine', tr: 'Konstantin' },
  'القاهرة': { en: 'Cairo', tr: 'Kahire' },
  'الإسكندرية': { en: 'Alexandria', tr: 'İskenderiye' },
  'دبي': { en: 'Dubai', tr: 'Dubai' },
  'أبوظبي': { en: 'Abu Dhabi', tr: 'Abu Dabi' },
  'الشارقة': { en: 'Sharjah', tr: 'Şarja' },
  'الدوحة': { en: 'Doha', tr: 'Doha' },
  'الكويت': { en: 'Kuwait', tr: 'Kuveyt' },
  'مدينة الكويت': { en: 'Kuwait City', tr: 'Kuveyt Şehri' },
  'المنامة': { en: 'Manama', tr: 'Manama' },
  'مسقط': { en: 'Muscat', tr: 'Maskat' },
  'عمان': { en: 'Amman', tr: 'Amman' },
  'بيروت': { en: 'Beirut', tr: 'Beyrut' },
  'بغداد': { en: 'Baghdad', tr: 'Bağdat' },
  'الدار البيضاء': { en: 'Casablanca', tr: 'Kazablanka' },
  'الرباط': { en: 'Rabat', tr: 'Rabat' },
  'مراكش': { en: 'Marrakech', tr: 'Marakeş' },
  'تونس': { en: 'Tunis', tr: 'Tunus' },
  'طرابلس': { en: 'Tripoli', tr: 'Trablus' },
  'إسطنبول': { en: 'Istanbul', tr: 'İstanbul' },
  'أنقرة': { en: 'Ankara', tr: 'Ankara' },
  'غازي عنتاب': { en: 'Gaziantep', tr: 'Gaziantep' },
  'مرسين': { en: 'Mersin', tr: 'Mersin' },
  'بورصة': { en: 'Bursa', tr: 'Bursa' },
  'لندن': { en: 'London', tr: 'Londra' },
  'باريس': { en: 'Paris', tr: 'Paris' },
  'نيويورك': { en: 'New York', tr: 'New York' },
  'المملكة العربية السعودية': { en: 'Kingdom of Saudi Arabia', tr: 'Suudi Arabistan Krallığı' },
  'السعودية': { en: 'Saudi Arabia', tr: 'Suudi Arabistan' },
  'الجمهورية العربية السورية': { en: 'Syrian Arab Republic', tr: 'Suriye Arap Cumhuriyeti' },
  'سوريا': { en: 'Syria', tr: 'Suriye' },
  'سورية': { en: 'Syria', tr: 'Suriye' },
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

  // Registered Firms & Slogans & Addresses
  'مكتب المحامي عبد الرحمن نحوي': { en: 'Law Office of Attorney Abdul Rahman Nahwi', tr: 'Avukat Abdurrahman Nahvi Hukuk ve Danışmanlık Bürosu' },
  'المحامي عبد الرحمن نحوي': { en: 'Attorney Abdul Rahman Nahwi', tr: 'Avukat Abdurrahman Nahvi' },
  'عبد الرحمن نحوي': { en: 'Abdul Rahman Nahwi', tr: 'Abdurrahman Nahvi' },
  'مكتب الخير للمحاماة والاستشارات القانونية': { en: 'Al-Khair Law Firm & Legal Consultancy', tr: 'Al-Khair Hukuk ve Danışmanlık Bürosu' },
  'مكتب المحامي أحمد جعفر': { en: 'Law Office of Attorney Ahmad Jaafar', tr: 'Avukat Ahmed Cafer Hukuk Bürosu' },
  'المحامي أحمد جعفر': { en: 'Attorney Ahmad Jaafar', tr: 'Avukat Ahmed Cafer' },
  'أحمد جعفر': { en: 'Ahmad Jaafar', tr: 'Ahmed Cafer' },
  'المحامي محمد خير الله': { en: 'Attorney Mohammed Khairallah', tr: 'Avukat Muhammed Hayrullah' },
  'مكتب العدل والريادة للمحاماة والاستشارات القانونية': { en: 'Al-Adl & Leadership Law Firm & Legal Consultancy', tr: 'Al-Adl & Liderlik Hukuk ve Danışmanlık Bürosu' },
  'مكتب التميمي ومشاركوه للمحاماة': { en: 'Al-Tamimi & Co. Law Firm', tr: 'Al-Tamimi & Ortakları Hukuk Bürosu' },
  'مجموعة بن محفوظ للاستشارات القانونية والتحكيم': { en: 'Bin Mahfouz Legal Consultancy & Arbitration Group', tr: 'Bin Mahfuz Hukuki Danışmanlık ve Tahkim Grubu' },
  'منصة محامون': { en: 'Lawyers Platform', tr: 'Hukukçular Platformu' },
  'منصة محامون | البوابة القانونية المعتمدة': { en: 'Lawyers Platform | Accredited Legal Gateway', tr: 'Hukukçular Platformu | Akredite Hukuk Portalı' },
  'حيث تلتقي العراقة القضائية بالرؤية القانونية الحديثة لحماية مصالحك': { en: 'Where Judicial Heritage Meets Modern Legal Strategy to Safeguard Your Interests', tr: 'Çıkarlarınızı Korumak İçin Köklü Yargı Tecrübesi ile Modern Hukuk Vizyonunun Buluştuğu Nokta' },
  'العدل أساس الملك، والحق قوّة لا تقهر': { en: 'Justice is the Foundation of Governance, and Right is an Invincible Force', tr: 'Adalet Mülkün Temelidir ve Hak Yenilmez Bir Güçtür' },
  'خبرة قانونية راسخة في القضايا الجزائية والمدنية والتجارية والعقارية والتحكيم': { en: 'Deep-Rooted Legal Expertise in Criminal, Civil, Commercial, Real Estate Litigation & Arbitration', tr: 'Ceza, Medeni, Ticari, Gayrimenkul Davaları ve Tahkimde Köklü Hukuki Uzmanlık' },
  'مكتب قانوني رائد يقدم خدمات التمثيل القضائي والاستشارات القانونية والتحكيم باحترافية وموثوقية عالية.': { en: 'A premier law firm delivering judicial representation, legal consultancy, and arbitration with high professionalism and reliability.', tr: 'Yüksek profesyonellik ve güvenilirlikle yargısal temsil, hukuki danışmanlık ve tahkim hizmetleri sunan öncü hukuk bürosu.' },
  'سوريا - حلب - الجميلية - أمام القصر العدلي': { en: 'Syria - Aleppo - Al-Jamiliyah - Opposite the Palace of Justice', tr: 'Suriye - Halep - El-Cemiliye - Adliye Sarayı Karşısı' },
  'حلب - الجميلية - أمام القصر العدلي': { en: 'Aleppo - Al-Jamiliyah - Opposite the Palace of Justice', tr: 'Halep - El-Cemiliye - Adliye Sarayı Karşısı' },
  'حلب - المحافظة - شارع بارون': { en: 'Aleppo - Al-Muhafaza - Baron Street', tr: 'Halep - El-Muhafaza - Baron Caddesi' },
  'الأحد - الخميس: 9:00 صباحاً - 6:00 مساءً': { en: 'Sunday - Thursday: 9:00 AM - 6:00 PM', tr: 'Pazar - Perşembe: 09:00 - 18:00' },
  'الأحد - الخميس: 8:00 صباحاً - 6:00 مساءً': { en: 'Sunday - Thursday: 8:00 AM - 6:00 PM', tr: 'Pazar - Perşembe: 08:00 - 18:00' },
  'السبت - الخميس: 9:00 صباحاً - 5:00 مساءً': { en: 'Saturday - Thursday: 9:00 AM - 5:00 PM', tr: 'Cumartesi - Perşembe: 09:00 - 17:00' },
  'السبت - الخميس: 9:00 صباحاً - 8:00 مساءً': { en: 'Saturday - Thursday: 9:00 AM - 8:00 PM', tr: 'Cumartesi - Perşembe: 09:00 - 20:00' },
  'مليار ليرة سورية مبالغ وقضايا محمية': { en: 'Billion SYP Protected & Recovered Assets', tr: 'Milyar SYP Korunan ve Kurtarılan Değer' },
  'مليون ريال مبالغ مستردة ومحمية': { en: 'Million SAR Protected & Recovered Capital', tr: 'Milyon SAR Korunan ve Kurtarılan Sermaye' },
  'مليون دولار مبالغ مستردة ومحمية': { en: 'Million USD Protected & Recovered Capital', tr: 'Milyon USD Korunan ve Kurtarılan Sermaye' },

  // Common Case Studies, Practice Areas, Blog Posts & Testimonials in firms_data.json
  'حكم براءة لبموكلة فضيلة المحمود': { en: 'Acquittal Verdict for Client Fadila Al-Mahmoud', tr: 'Müvekkil Fazile El-Mahmud İçin Beraat Kararı' },
  'حكم براءة لموكلة فضيلة المحمود': { en: 'Acquittal Verdict for Client Fadila Al-Mahmoud', tr: 'Müvekkil Fazile El-Mahmud İçin Beraat Kararı' },
  'جنايات': { en: 'Criminal Felonies', tr: 'Ağır Ceza Davaları' },
  'قضايا جزائية': { en: 'Criminal Cases', tr: 'Ceza Davaları' },
  'قضايا عقارية': { en: 'Real Estate Cases', tr: 'Gayrimenkul Davaları' },
  'قضايا تجارية': { en: 'Commercial Cases', tr: 'Ticari Davalar' },
  'قضايا مدنية': { en: 'Civil Cases', tr: 'Medeni Hukuk Davaları' },
  'قضايا شرعية وأحوال شخصية': { en: 'Family & Personal Status Law', tr: 'Aile ve Kişiler Hukuku Davaları' },
  'تحكيم تجاري': { en: 'Commercial Arbitration', tr: 'Ticari Tahkim' },
  'إعلان براءة الموكلة من التهم المنسوبة إليها وإخلاء سبيلها فوراً': { en: 'Full acquittal of the client from all charges and immediate release', tr: 'Müvekkilin kendisine yöneltilen tüm suçlamalardan beraatine ve derhal tahliyesine karar verilmesi' },
  'تمثيل الموكلة أمام محكمة الجنايات وتقديم الدفوع القانونية والأدلة القاطعة التي أثبتت براءتها التامة.': { en: 'Representing the client before the Felony Court and presenting conclusive legal defenses and evidence proving her complete innocence.', tr: 'Müvekkilin Ağır Ceza Mahkemesi önünde temsil edilmesi ve tam masumiyetini kanıtlayan kesin hukuki savunmaların ve delillerin sunulması.' },
  'حكم براءة قطعي': { en: 'Final Acquittal Verdict', tr: 'Kesin Beraat Kararı' },
  'حكم براءة': { en: 'Acquittal Verdict', tr: 'Beraat Kararı' },
  'قضية كبرى': { en: 'Major Landmark Case', tr: 'Büyük Emsal Dava' },
  'الأصل البراءة': { en: 'Presumption of Innocence', tr: 'Masumiyet Karinesi' },
  'المتهم بريء حتى تثبت إدانته بحكم قضائي مبرم': { en: 'The accused is innocent until proven guilty by a final judicial verdict', tr: 'Sanık, kesinleşmiş bir yargı kararıyla suçluluğu sabit oluncaya kadar masumdur' },
  'إن قرينة البراءة هي حجر الزاوية في العدالة الجزائية، فلا يجوز بناء الأحكام الجزائية إلا على الجزم واليقين لا على الشك والتخمين.': { en: 'The presumption of innocence is the cornerstone of criminal justice; criminal verdicts must be built on certainty and conclusive proof, never on doubt or speculation.', tr: 'Masumiyet karinesi ceza adaletinin temel taşıdır; ceza hükümleri şüphe ve tahmine değil, yalnızca kesinlik ve kanaate dayandırılmalıdır.' },
  'القانون الجزائي': { en: 'Criminal Law', tr: 'Ceza Hukuku' },
  'القانون المدني': { en: 'Civil Law', tr: 'Medeni Hukuk' },
  'القانون التجاري': { en: 'Commercial Law', tr: 'Ticaret Hukuku' },
  'القانون العقاري': { en: 'Real Estate Law', tr: 'Gayrimenkul Hukuku' },
  'الأحوال الشخصية': { en: 'Personal Status & Family Law', tr: 'Kişiler ve Aile Hukuku' },
  'التحكيم التجاري والمدني': { en: 'Commercial & Civil Arbitration', tr: 'Ticari ve Medeni Tahkim' },
  'تأسيس الشركات والعقود التجارية': { en: 'Company Formation & Commercial Contracts', tr: 'Şirket Kuruluşu ve Ticari Sözleşmeler' },
  'تثبيت ملكية عقارية واسترداد عقار': { en: 'Real Estate Ownership Confirmation & Property Recovery', tr: 'Gayrimenkul Mülkiyetinin Tespiti ve Taşınmazın İadesi' },
  'استرداد كامل العقار وتثبيت الملكية في السجل العقاري': { en: 'Full recovery of the property and registration of title in the Land Registry', tr: 'Taşınmazın tamamen geri alınması ve mülkiyetin tapu siciline tescili' },
};

/**
 * Returns true if the string contains any Arabic script characters
 */
export function hasArabicChars(text: string | undefined | null): boolean {
  if (!text) return false;
  return /[\u0600-\u06FF]/.test(text);
}

// Letters and phonetic transliteration mapping to guarantee zero Arabic characters in non-Arabic views
const AR_TO_LATIN: Record<string, string> = {
  'ا': 'a', 'أ': 'a', 'إ': 'e', 'آ': 'aa', 'ء': "'", 'ئ': 'i', 'ؤ': 'o', 'ى': 'a', 'ة': 'ah',
  'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j', 'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'dh',
  'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh', 'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z',
  'ع': 'a', 'غ': 'gh', 'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
  'ه': 'h', 'و': 'w', 'ي': 'y', '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
  '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9', '،': ',', '؛': ';', '؟': '?'
};

const AR_TO_TR_LATIN: Record<string, string> = {
  ...AR_TO_LATIN,
  'ج': 'c', 'ش': 'ş', 'خ': 'h', 'ذ': 'z', 'ث': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z', 'و': 'v'
};

const COMMON_WORD_MAP: Record<string, { en: string; tr: string }> = {
  'المحامي': { en: 'Attorney', tr: 'Avukat' },
  'محامي': { en: 'Attorney', tr: 'Avukat' },
  'المحامين': { en: 'Attorneys', tr: 'Avukatlar' },
  'محامين': { en: 'Attorneys', tr: 'Avukatlar' },
  'المحاماة': { en: 'Law Practice', tr: 'Avukatlık' },
  'مكتب': { en: 'Office', tr: 'Bürosu' },
  'مكاتب': { en: 'Offices', tr: 'Bürolar' },
  'شركة': { en: 'Company', tr: 'Şirket' },
  'شركات': { en: 'Corporations', tr: 'Şirketler' },
  'شريك': { en: 'Partner', tr: 'Ortak' },
  'الشركاء': { en: 'Partners', tr: 'Ortaklar' },
  'مؤسس': { en: 'Founder', tr: 'Kurucu' },
  'المؤسس': { en: 'The Founder', tr: 'Kurucu' },
  'مؤسسون': { en: 'Founders', tr: 'Kurucular' },
  'المؤسسون': { en: 'Founding Partners', tr: 'Kurucu Ortaklar' },
  'مستشار': { en: 'Counsel', tr: 'Müşavir' },
  'المستشار': { en: 'Legal Counsel', tr: 'Hukuk Müşaviri' },
  'مستشارون': { en: 'Counselors', tr: 'Müşavirler' },
  'المستشارون': { en: 'Legal Counselors', tr: 'Hukuk Müşavirleri' },
  'استشارات': { en: 'Consultancy', tr: 'Danışmanlık' },
  'الاستشارات': { en: 'Consultations', tr: 'Danışmanlık' },
  'قانونية': { en: 'Legal', tr: 'Hukuki' },
  'القانونية': { en: 'Legal', tr: 'Hukuki' },
  'قانون': { en: 'Law', tr: 'Hukuk' },
  'القانون': { en: 'The Law', tr: 'Hukuk' },
  'تحكيم': { en: 'Arbitration', tr: 'Tahkim' },
  'التحكيم': { en: 'Arbitration', tr: 'Tahkim' },
  'دولي': { en: 'International', tr: 'Uluslararası' },
  'الدولي': { en: 'International', tr: 'Uluslararası' },
  'دولية': { en: 'International', tr: 'Uluslararası' },
  'الدولية': { en: 'International', tr: 'Uluslararası' },
  'قضايا': { en: 'Cases', tr: 'Davalar' },
  'القضايا': { en: 'Cases', tr: 'Davalar' },
  'دعاوى': { en: 'Lawsuits', tr: 'Davalar' },
  'الدعاوى': { en: 'Lawsuits', tr: 'Davalar' },
  'نزاعات': { en: 'Disputes', tr: 'Uyuşmazlıklar' },
  'النزاعات': { en: 'Disputes', tr: 'Uyuşmazlıklar' },
  'تجاري': { en: 'Commercial', tr: 'Ticari' },
  'التجاري': { en: 'Commercial', tr: 'Ticari' },
  'تجارية': { en: 'Commercial', tr: 'Ticari' },
  'التجارية': { en: 'Commercial', tr: 'Ticari' },
  'مدني': { en: 'Civil', tr: 'Medeni' },
  'المدني': { en: 'Civil', tr: 'Medeni' },
  'مدنية': { en: 'Civil', tr: 'Medeni' },
  'المدنية': { en: 'Civil', tr: 'Medeni' },
  'جنائي': { en: 'Criminal', tr: 'Ceza' },
  'الجنائي': { en: 'Criminal', tr: 'Ceza' },
  'جنائية': { en: 'Criminal', tr: 'Ceza' },
  'الجنائية': { en: 'Criminal', tr: 'Ceza' },
  'جزائي': { en: 'Criminal', tr: 'Ceza' },
  'الجزائي': { en: 'Criminal', tr: 'Ceza' },
  'جزائية': { en: 'Criminal', tr: 'Ceza' },
  'الجزائية': { en: 'Criminal', tr: 'Ceza' },
  'عقاري': { en: 'Real Estate', tr: 'Gayrimenkul' },
  'العقاري': { en: 'Real Estate', tr: 'Gayrimenkul' },
  'عقارية': { en: 'Real Estate', tr: 'Gayrimenkul' },
  'العقارية': { en: 'Real Estate', tr: 'Gayrimenkul' },
  'عمالي': { en: 'Labor & Employment', tr: 'İş Hukuku' },
  'العمالي': { en: 'Labor & Employment', tr: 'İş Hukuku' },
  'عمالية': { en: 'Labor & Employment', tr: 'İş Hukuku' },
  'العمالية': { en: 'Labor & Employment', tr: 'İş Hukuku' },
  'مصرفي': { en: 'Banking', tr: 'Bankacılık' },
  'المصرفي': { en: 'Banking', tr: 'Bankacılık' },
  'مصرفية': { en: 'Banking', tr: 'Bankacılık' },
  'المصرفية': { en: 'Banking', tr: 'Bankacılık' },
  'مالي': { en: 'Financial', tr: 'Finansal' },
  'المالي': { en: 'Financial', tr: 'Finansal' },
  'مالية': { en: 'Financial', tr: 'Finansal' },
  'المالية': { en: 'Financial', tr: 'Finansal' },
  'شرعي': { en: 'Family Law', tr: 'Aile Hukuku' },
  'الشرعي': { en: 'Family Law', tr: 'Aile Hukuku' },
  'شرعية': { en: 'Family Law', tr: 'Aile Hukuku' },
  'الشرعية': { en: 'Family Law', tr: 'Aile Hukuku' },
  'نقابة': { en: 'Bar Association', tr: 'Barolar Birliği' },
  'النقابة': { en: 'Bar Association', tr: 'Barolar Birliği' },
  'فرع': { en: 'Branch', tr: 'Şubesi' },
  'الفرع': { en: 'Branch', tr: 'Şube' },
  'جامعة': { en: 'University', tr: 'Üniversitesi' },
  'الجامعة': { en: 'University', tr: 'Üniversite' },
  'كلية': { en: 'Faculty of', tr: 'Fakültesi' },
  'الكلية': { en: 'Faculty', tr: 'Fakülte' },
  'حقوق': { en: 'Law', tr: 'Hukuk' },
  'الحقوق': { en: 'Law', tr: 'Hukuk' },
  'إجازة': { en: 'Bachelor Degree (LL.B.)', tr: 'Lisans Derecesi' },
  'ماجستير': { en: 'Master Degree (LL.M.)', tr: 'Yüksek Lisans' },
  'دكتوراه': { en: 'Doctorate (Ph.D.)', tr: 'Doktora' },
  'معتمد': { en: 'Accredited', tr: 'Akredite' },
  'المعتمد': { en: 'Accredited', tr: 'Akredite' },
  'ممارس': { en: 'Practicing', tr: 'Ruhsatlı' },
  'مرخص': { en: 'Licensed', tr: 'Lisanslı' },
  'الرئيسي': { en: 'Main / Headquarters', tr: 'Merkez' },
  'ساعات': { en: 'Hours', tr: 'Saatler' },
  'العمل': { en: 'Working', tr: 'Çalışma' },
  'يوم': { en: 'Day', tr: 'Gün' },
  'الأحد': { en: 'Sunday', tr: 'Pazar' },
  'الإثنين': { en: 'Monday', tr: 'Pazartesi' },
  'الثلاثاء': { en: 'Tuesday', tr: 'Salı' },
  'الأربعاء': { en: 'Wednesday', tr: 'Çarşamba' },
  'الخميس': { en: 'Thursday', tr: 'Perşembe' },
  'الجمعة': { en: 'Friday', tr: 'Cuma' },
  'السبت': { en: 'Saturday', tr: 'Cumartesi' },
  'صباحاً': { en: 'AM', tr: 'ÖÖ' },
  'مساءً': { en: 'PM', tr: 'ÖS' },
  'قضية': { en: 'Case', tr: 'Dava' },
  'سنة': { en: 'Years', tr: 'Yıl' },
  'سنوات': { en: 'Years', tr: 'Yıl' },
  'خبرة': { en: 'Experience', tr: 'Deneyim' },
  'في': { en: 'in', tr: 'içinde' },
  'من': { en: 'from', tr: 'tarafından' },
  'إلى': { en: 'to', tr: 'kadar' },
  'على': { en: 'on', tr: 'üzerinde' },
  'مع': { en: 'with', tr: 'ile' },
  'عن': { en: 'about', tr: 'hakkında' },
  'و': { en: '&', tr: 've' },
  'أو': { en: 'or', tr: 'veya' }
};

/**
 * Universal Sanitizer: Absolutely guarantees that ZERO Arabic characters remain
 * when browsing in English or Turkish.
 */
export function sanitizeNoArabic(text: string | undefined | null, targetLang: 'en' | 'tr'): string {
  if (!text) return '';
  const trimmed = text.trim();
  if (!hasArabicChars(trimmed)) return trimmed;

  // 1. Direct glossary match
  if (LEGAL_GLOSSARY[trimmed]?.[targetLang]) {
    return LEGAL_GLOSSARY[trimmed][targetLang];
  }

  // 2. Pattern replacements
  let s = translateByPatterns(trimmed, targetLang);
  if (!hasArabicChars(s)) return s;

  // 3. Known multi-word phrases from glossary
  for (const [arKey, langMap] of Object.entries(LEGAL_GLOSSARY)) {
    if (s.includes(arKey)) {
      s = s.split(arKey).join(langMap[targetLang] || langMap.en);
    }
  }
  if (!hasArabicChars(s)) return s;

  // 4. Tokenize and map single words
  const words = s.split(/(\s+|[^\w\u0600-\u06FF]+)/);
  const mappedWords = words.map(w => {
    if (!hasArabicChars(w)) return w;
    const cleanWord = w.trim();
    if (COMMON_WORD_MAP[cleanWord]?.[targetLang]) {
      return COMMON_WORD_MAP[cleanWord][targetLang];
    }
    // Check if word has 'ال' prefix
    if (cleanWord.startsWith('ال') && COMMON_WORD_MAP[cleanWord.slice(2)]?.[targetLang]) {
      const trans = COMMON_WORD_MAP[cleanWord.slice(2)][targetLang];
      return targetLang === 'en' ? `The ${trans}` : trans;
    }
    // Phonetic letter conversion for person names or unmapped words
    const letterMap = targetLang === 'tr' ? AR_TO_TR_LATIN : AR_TO_LATIN;
    let transliterated = '';
    for (const char of cleanWord) {
      transliterated += letterMap[char] !== undefined ? letterMap[char] : char;
    }
    // Capitalize first letter of names
    if (transliterated.length > 0) {
      transliterated = transliterated.charAt(0).toUpperCase() + transliterated.slice(1);
    }
    return transliterated;
  });

  let finalStr = mappedWords.join('');

  // 5. Final safety sweep: if any Arabic character somehow survived, replace with Latin equivalent
  if (hasArabicChars(finalStr)) {
    const letterMap = targetLang === 'tr' ? AR_TO_TR_LATIN : AR_TO_LATIN;
    let purged = '';
    for (const char of finalStr) {
      if (/[\u0600-\u06FF]/.test(char)) {
        purged += letterMap[char] || '';
      } else {
        purged += char;
      }
    }
    finalStr = purged;
  }

  return finalStr.replace(/\s+/g, ' ').trim();
}

/**
 * Rule-based smart pattern translator for instant 0ms fallback
 */
function translateByPatterns(text: string, targetLang: 'en' | 'tr'): string {
  let s = text.trim();
  if (!hasArabicChars(s)) return s;

  // Exact match first
  if (LEGAL_GLOSSARY[s]?.[targetLang]) {
    return LEGAL_GLOSSARY[s][targetLang];
  }

  // Pattern: "نقابة المحامين في الجمهورية العربية السورية - فرع X"
  const barMatch = s.match(/^نقابة المحامين في الجمهورية العربية السورية\s*[-–—]\s*فرع\s+(.+)$/);
  if (barMatch) {
    const branchAr = barMatch[1].trim();
    const branchTranslated = LEGAL_GLOSSARY[branchAr]?.[targetLang] || branchAr;
    return targetLang === 'tr'
      ? `Suriye Arap Cumhuriyeti Barolar Birliği - ${branchTranslated} Şubesi`
      : `Syrian Bar Association - ${branchTranslated} Branch`;
  }

  // Pattern: "X دقائق قراءة" or "X دقيقة قراءة"
  const readTimeMatch = s.match(/^(\d+)\s*(دقائق|دقيقة)\s*(قراءة)?$/);
  if (readTimeMatch) {
    const mins = readTimeMatch[1];
    return targetLang === 'tr' ? `${mins} dk okuma` : `${mins} min read`;
  }

  // Pattern: Deal values like "650 مليون ريال" or "120 مليون دولار"
  const dealMatch = s.match(/^([\d.,+]+)\s*(مليون|مليار)\s*(ريال سعودي|ريال|دولار|ليرة سورية|ل\.س|درهم|يورو)?$/);
  if (dealMatch) {
    const num = dealMatch[1];
    const unit = dealMatch[2] === 'مليار' ? (targetLang === 'tr' ? 'Milyar' : 'Billion') : (targetLang === 'tr' ? 'Milyon' : 'Million');
    const currRaw = (dealMatch[3] || '').trim();
    const currMap: Record<string, string> = {
      'ريال سعودي': 'SAR',
      'ريال': 'SAR',
      'دولار': 'USD',
      'ليرة سورية': 'SYP',
      'ل.س': 'SYP',
      'درهم': 'AED',
      'يورو': 'EUR',
    };
    const curr = currMap[currRaw] || currRaw;
    return `${num} ${unit}${curr ? ' ' + curr : ''}`;
  }

  // Substring phrase replacements for common legal terms
  const phraseReplacements: Array<[string, string, string]> = [
    ['مكتب المحامي', 'Law Office of Attorney', 'Avukat Hukuk Bürosu:'],
    ['مكتب الأستاذ', 'Law Office of Counsel', 'Avukat Hukuk Bürosu:'],
    ['للمحاماة والاستشارات القانونية', 'for Law & Legal Consultancy', 'Hukuk ve Danışmanlık Bürosu'],
    ['للمحاماة والتحكيم', 'for Law & Arbitration', 'Hukuk ve Tahkim Bürosu'],
    ['المحامي الأستاذ', 'Attorney at Law', 'Avukat'],
    ['المحامي الدكتور', 'Dr. Attorney', 'Av. Dr.'],
    ['المحامي', 'Attorney', 'Avukat'],
    ['المستشار القانوني', 'Legal Counsel', 'Hukuk Müşaviri'],
    ['نقابة المحامين في الجمهورية العربية السورية', 'Syrian Bar Association', 'Suriye Barolar Birliği'],
    ['نقابة المحامين في سورية', 'Syrian Bar Association', 'Suriye Barolar Birliği'],
    ['نقابة المحامين', 'Bar Association', 'Barolar Birliği'],
    ['فرع حلب', 'Aleppo Branch', 'Halep Şubesi'],
    ['فرع دمشق', 'Damascus Branch', 'Şam Şubesi'],
    ['فرع حمص', 'Homs Branch', 'Humus Şubesi'],
    ['فرع حماة', 'Hama Branch', 'Hama Şubesi'],
    ['فرع اللاذقية', 'Latakia Branch', 'Lazkiye Şubesi'],
    ['الجمهورية العربية السورية', 'Syrian Arab Republic', 'Suriye Arap Cumhuriyeti'],
    ['المملكة العربية السعودية', 'Kingdom of Saudi Arabia', 'Suudi Arabistan Krallığı'],
    ['المقر الرئيسي', 'Headquarters', 'Genel Merkez'],
    ['دقائق قراءة', 'min read', 'dk okuma'],
    ['دقيقة قراءة', 'min read', 'dk okuma'],
    ['مليون ريال', 'Million SAR', 'Milyon SAR'],
    ['مليار ليرة سورية', 'Billion SYP', 'Milyar SYP'],
    ['مليون دولار', 'Million USD', 'Milyon USD'],
  ];

  let replaced = s;
  for (const [arPhrase, enPhrase, trPhrase] of phraseReplacements) {
    if (replaced.includes(arPhrase)) {
      replaced = replaced.split(arPhrase).join(targetLang === 'tr' ? trPhrase : enPhrase);
    }
  }

  return replaced;
}

// In-memory + localStorage cache for translated strings to guarantee 0ms repeat lookups
const TRANSLATION_CACHE_KEY = 'aladl_translation_cache_v2';
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
let syncDispatchTimer: any = null;
const pendingTranslations = new Set<string>();

function setCachedTranslation(key: string, val: string) {
  translationMemoryCache[key] = val;
  if (typeof window === 'undefined') return;
  if (cacheSaveTimer) clearTimeout(cacheSaveTimer);
  cacheSaveTimer = setTimeout(() => {
    try {
      const keys = Object.keys(translationMemoryCache);
      if (keys.length > 1500) {
        for (let i = 0; i < keys.length - 1500; i++) {
          delete translationMemoryCache[keys[i]];
        }
      }
      localStorage.setItem(TRANSLATION_CACHE_KEY, JSON.stringify(translationMemoryCache));
    } catch {}
  }, 400);
}

function queueBackgroundTranslation(trimmed: string, targetLang: 'en' | 'tr') {
  if (typeof window === 'undefined') return;
  const cacheKey = `${targetLang}:${trimmed}`;
  if (pendingTranslations.has(cacheKey) || translationMemoryCache[cacheKey]) return;
  pendingTranslations.add(cacheKey);

  translateText(trimmed, targetLang)
    .then((res) => {
      pendingTranslations.delete(cacheKey);
      if (res && res !== trimmed && !hasArabicChars(res)) {
        if (syncDispatchTimer) clearTimeout(syncDispatchTimer);
        syncDispatchTimer = setTimeout(() => {
          window.dispatchEvent(new CustomEvent('aladl_storage_sync'));
        }, 180);
      }
    })
    .catch(() => {
      pendingTranslations.delete(cacheKey);
    });
}

/**
 * Synchronous instant glossary/cache lookup (0ms, no network) + automatic background fetch if not cached
 * GUARANTEE: Never returns any Arabic characters when targetLang is 'en' or 'tr'!
 */
export function translateTextSync(text: string | undefined, targetLang: 'en' | 'tr', fallback?: string): string {
  if (!text || text.trim() === '') return fallback || '';
  const trimmed = text.trim();

  if (!hasArabicChars(trimmed)) {
    return trimmed;
  }

  if (LEGAL_GLOSSARY[trimmed] && LEGAL_GLOSSARY[trimmed][targetLang]) {
    return LEGAL_GLOSSARY[trimmed][targetLang];
  }

  const cacheKey = `${targetLang}:${trimmed}`;
  if (translationMemoryCache[cacheKey] && !hasArabicChars(translationMemoryCache[cacheKey])) {
    return translationMemoryCache[cacheKey];
  }

  // Trigger non-blocking background translation so UI updates automatically once resolved
  queueBackgroundTranslation(trimmed, targetLang);

  // If fallback is provided and has no Arabic characters, use it while background translation completes
  if (fallback && fallback.trim() !== '' && !hasArabicChars(fallback)) {
    return fallback;
  }

  return sanitizeNoArabic(trimmed, targetLang);
}

/**
 * Translate a single text string from Arabic to target language ('en' or 'tr')
 * with server proxy priority, MyMemory fallback, instant cache lookup, and sanitize guarantee
 */
export async function translateText(text: string, targetLang: 'en' | 'tr'): Promise<string> {
  if (!text || text.trim() === '') return '';
  const trimmed = text.trim();

  if (!hasArabicChars(trimmed)) {
    return trimmed;
  }

  // 1. Check exact match in Legal Glossary
  if (LEGAL_GLOSSARY[trimmed] && LEGAL_GLOSSARY[trimmed][targetLang]) {
    return LEGAL_GLOSSARY[trimmed][targetLang];
  }

  // 2. Check instant memory cache (ensure cached value does not contain untranslated Arabic)
  const cacheKey = `${targetLang}:${trimmed}`;
  if (translationMemoryCache[cacheKey] && !hasArabicChars(translationMemoryCache[cacheKey])) {
    return translationMemoryCache[cacheKey];
  }

  // 3. Try our own backend server proxy endpoint (/api/translate)
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: trimmed, targetLang }),
      signal: controller.signal
    });
    clearTimeout(timer);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.translation && !hasArabicChars(data.translation)) {
        const finalStr = data.translation.trim();
        setCachedTranslation(cacheKey, finalStr);
        return finalStr;
      }
    }
  } catch {}

  // 4. Try MyMemory Translation API directly
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=ar|${targetLang}`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (res.ok) {
      const data = await res.json();
      const trans = data?.responseData?.translatedText;
      if (trans && typeof trans === 'string' && !hasArabicChars(trans)) {
        const finalStr = trans.trim();
        setCachedTranslation(cacheKey, finalStr);
        return finalStr;
      }
    }
  } catch {}

  // 5. Fallback to sanitizeNoArabic: converts all phrases, words, and letters without any Arabic
  const sanitized = sanitizeNoArabic(trimmed, targetLang);
  if (sanitized && !hasArabicChars(sanitized)) {
    setCachedTranslation(cacheKey, sanitized);
    return sanitized;
  }

  return sanitized;
}

/**
 * Helper: translate if Arabic source changed, or if existing target is empty OR still contains Arabic characters!
 */
async function smartTranslateField(
  arText: string | undefined,
  prevArText: string | undefined,
  existingTarget: string | undefined,
  targetLang: 'en' | 'tr',
  forceAll = false
): Promise<string> {
  if (!arText || arText.trim() === '') {
    return sanitizeNoArabic(existingTarget || '', targetLang);
  }
  const arTrimmed = arText.trim();
  const prevTrimmed = (prevArText || '').trim();
  const targetHasArabic = hasArabicChars(existingTarget);

  // If not forcing all, and Arabic text did NOT change, and we already have a valid non-Arabic target translation, skip network!
  if (
    !forceAll &&
    prevArText !== undefined &&
    arTrimmed === prevTrimmed &&
    existingTarget &&
    existingTarget.trim() !== '' &&
    !targetHasArabic
  ) {
    return existingTarget;
  }

  // Also if prevArText is undefined, if existingTarget is already populated, non-Arabic, and different from arTrimmed, keep it unless forced
  if (
    !forceAll &&
    prevArText === undefined &&
    existingTarget &&
    existingTarget.trim() !== '' &&
    existingTarget.trim() !== arTrimmed &&
    !targetHasArabic
  ) {
    return existingTarget;
  }

  const translated = await translateText(arTrimmed, targetLang);
  if (translated && !hasArabicChars(translated)) return translated;
  if (existingTarget && !targetHasArabic) return existingTarget;
  return sanitizeNoArabic(translated || existingTarget || arTrimmed, targetLang);
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
    texts.every((item, i) => item.trim() === (prevTexts[i] || '').trim()) &&
    existingTargets.every((t) => t && t.trim() !== '' && !hasArabicChars(t))
  ) {
    return existingTargets;
  }
  return Promise.all(
    texts.map(async (item, idx) => {
      if (!item || !item.trim()) return '';
      const existingItem = existingTargets?.[idx]?.trim();
      if (
        !forceAll &&
        prevTexts &&
        existingItem &&
        !hasArabicChars(existingItem) &&
        prevTexts[idx]?.trim() === item.trim()
      ) {
        return existingItem;
      }
      if (
        !forceAll &&
        !prevTexts &&
        existingItem &&
        !hasArabicChars(existingItem) &&
        existingItem !== item.trim()
      ) {
        return existingItem;
      }
      const translated = await translateText(item, targetLang);
      return sanitizeNoArabic(translated || existingItem || item, targetLang);
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
 * Automatically translate Case Study (all fields in EN & TR)
 */
export async function autoTranslateCaseStudy(item: CaseStudy, prevItem?: CaseStudy | null, forceAll = false): Promise<CaseStudy> {
  const [
    titleEn, titleTr,
    categoryEn, categoryTr,
    summaryEn, summaryTr,
    outcomeEn, outcomeTr,
    highlightEn, highlightTr,
    valueEn, valueTr
  ] = await Promise.all([
    smartTranslateField(item.title, prevItem?.title, item.titleEn, 'en', forceAll),
    smartTranslateField(item.title, prevItem?.title, item.titleTr, 'tr', forceAll),
    smartTranslateField(item.category, prevItem?.category, item.categoryEn, 'en', forceAll),
    smartTranslateField(item.category, prevItem?.category, item.categoryTr, 'tr', forceAll),
    smartTranslateField(item.summary, prevItem?.summary, item.summaryEn, 'en', forceAll),
    smartTranslateField(item.summary, prevItem?.summary, item.summaryTr, 'tr', forceAll),
    smartTranslateField(item.outcome, prevItem?.outcome, item.outcomeEn, 'en', forceAll),
    smartTranslateField(item.outcome, prevItem?.outcome, item.outcomeTr, 'tr', forceAll),
    smartTranslateField(item.highlight, prevItem?.highlight, item.highlightEn, 'en', forceAll),
    smartTranslateField(item.highlight, prevItem?.highlight, item.highlightTr, 'tr', forceAll),
    smartTranslateField(item.value, prevItem?.value, item.valueEn, 'en', forceAll),
    smartTranslateField(item.value, prevItem?.value, item.valueTr, 'tr', forceAll),
  ]);

  return {
    ...item,
    titleEn: titleEn || item.titleEn || item.title,
    titleTr: titleTr || item.titleTr || item.title,
    categoryEn: categoryEn || item.categoryEn || item.category,
    categoryTr: categoryTr || item.categoryTr || item.category,
    summaryEn: summaryEn || item.summaryEn || item.summary,
    summaryTr: summaryTr || item.summaryTr || item.summary,
    outcomeEn: outcomeEn || item.outcomeEn || item.outcome,
    outcomeTr: outcomeTr || item.outcomeTr || item.outcome,
    highlightEn: highlightEn || item.highlightEn || item.highlight,
    highlightTr: highlightTr || item.highlightTr || item.highlight,
    valueEn: valueEn || item.valueEn || item.value,
    valueTr: valueTr || item.valueTr || item.value,
  };
}

/**
 * Automatically translate Testimonial (all fields in EN & TR)
 */
export async function autoTranslateTestimonial(item: Testimonial, prevItem?: Testimonial | null, forceAll = false): Promise<Testimonial> {
  const [
    clientNameEn, clientNameTr,
    clientRoleEn, clientRoleTr,
    companyEn, companyTr,
    contentEn, contentTr,
    caseTypeEn, caseTypeTr
  ] = await Promise.all([
    smartTranslateField(item.clientName, prevItem?.clientName, item.clientNameEn, 'en', forceAll),
    smartTranslateField(item.clientName, prevItem?.clientName, item.clientNameTr, 'tr', forceAll),
    smartTranslateField(item.clientRole, prevItem?.clientRole, item.clientRoleEn, 'en', forceAll),
    smartTranslateField(item.clientRole, prevItem?.clientRole, item.clientRoleTr, 'tr', forceAll),
    smartTranslateField(item.company, prevItem?.company, item.companyEn, 'en', forceAll),
    smartTranslateField(item.company, prevItem?.company, item.companyTr, 'tr', forceAll),
    smartTranslateField(item.content, prevItem?.content, item.contentEn, 'en', forceAll),
    smartTranslateField(item.content, prevItem?.content, item.contentTr, 'tr', forceAll),
    smartTranslateField(item.caseType, prevItem?.caseType, item.caseTypeEn, 'en', forceAll),
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
    caseTypeEn: caseTypeEn || item.caseTypeEn || item.caseType,
    caseTypeTr: caseTypeTr || item.caseTypeTr || item.caseType,
  };
}

/**
 * Automatically translate BlogPost (all fields in EN & TR)
 */
export async function autoTranslateBlogPost(post: BlogPost, prevPost?: BlogPost | null, forceAll = false): Promise<BlogPost> {
  const [
    titleEn, titleTr,
    excerptEn, excerptTr,
    contentEn, contentTr,
    categoryEn, categoryTr,
    authorNameEn, authorNameTr,
    authorRoleEn, authorRoleTr,
    dateEn, dateTr,
    readTimeEn, readTimeTr,
    tagsEn, tagsTr
  ] = await Promise.all([
    smartTranslateField(post.title, prevPost?.title, post.titleEn, 'en', forceAll),
    smartTranslateField(post.title, prevPost?.title, post.titleTr, 'tr', forceAll),
    smartTranslateField(post.excerpt, prevPost?.excerpt, post.excerptEn, 'en', forceAll),
    smartTranslateField(post.excerpt, prevPost?.excerpt, post.excerptTr, 'tr', forceAll),
    smartTranslateField(post.content, prevPost?.content, post.contentEn, 'en', forceAll),
    smartTranslateField(post.content, prevPost?.content, post.contentTr, 'tr', forceAll),
    smartTranslateField(post.category, prevPost?.category, post.categoryEn, 'en', forceAll),
    smartTranslateField(post.category, prevPost?.category, post.categoryTr, 'tr', forceAll),
    smartTranslateField(post.authorName, prevPost?.authorName, post.authorNameEn, 'en', forceAll),
    smartTranslateField(post.authorName, prevPost?.authorName, post.authorNameTr, 'tr', forceAll),
    smartTranslateField(post.authorRole, prevPost?.authorRole, post.authorRoleEn, 'en', forceAll),
    smartTranslateField(post.authorRole, prevPost?.authorRole, post.authorRoleTr, 'tr', forceAll),
    smartTranslateField(post.date, prevPost?.date, post.dateEn, 'en', forceAll),
    smartTranslateField(post.date, prevPost?.date, post.dateTr, 'tr', forceAll),
    smartTranslateField(post.readTime, prevPost?.readTime, post.readTimeEn, 'en', forceAll),
    smartTranslateField(post.readTime, prevPost?.readTime, post.readTimeTr, 'tr', forceAll),
    post.tags?.length ? translateTextArray(post.tags, 'en', prevPost?.tags, post.tagsEn, forceAll) : Promise.resolve(post.tagsEn || []),
    post.tags?.length ? translateTextArray(post.tags, 'tr', prevPost?.tags, post.tagsTr, forceAll) : Promise.resolve(post.tagsTr || []),
  ]);

  return {
    ...post,
    titleEn: titleEn || post.titleEn || post.title,
    titleTr: titleTr || post.titleTr || post.title,
    excerptEn: excerptEn || post.excerptEn || post.excerpt,
    excerptTr: excerptTr || post.excerptTr || post.excerpt,
    contentEn: contentEn || post.contentEn || post.content,
    contentTr: contentTr || post.contentTr || post.content,
    categoryEn: categoryEn || post.categoryEn || post.category,
    categoryTr: categoryTr || post.categoryTr || post.category,
    authorNameEn: authorNameEn || post.authorNameEn || post.authorName,
    authorNameTr: authorNameTr || post.authorNameTr || post.authorName,
    authorRoleEn: authorRoleEn || post.authorRoleEn || post.authorRole,
    authorRoleTr: authorRoleTr || post.authorRoleTr || post.authorRole,
    dateEn: dateEn || post.dateEn || post.date,
    dateTr: dateTr || post.dateTr || post.date,
    readTimeEn: readTimeEn || post.readTimeEn || post.readTime,
    readTimeTr: readTimeTr || post.readTimeTr || post.readTime,
    tagsEn: tagsEn?.length ? tagsEn : post.tagsEn,
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
 * Automatically translate WhyChooseUsPillar (only changed/missing fields)
 */
export async function autoTranslateWhyPillar(item: WhyChooseUsPillar, prevItem?: WhyChooseUsPillar | null, forceAll = false): Promise<WhyChooseUsPillar> {
  const [
    titleEn, titleTr,
    descEn, descTr
  ] = await Promise.all([
    smartTranslateField(item.titleAr, prevItem?.titleAr, item.titleEn, 'en', forceAll),
    smartTranslateField(item.titleAr, prevItem?.titleAr, item.titleTr, 'tr', forceAll),
    smartTranslateField(item.descAr, prevItem?.descAr, item.descEn, 'en', forceAll),
    smartTranslateField(item.descAr, prevItem?.descAr, item.descTr, 'tr', forceAll),
  ]);

  return {
    ...item,
    titleEn: titleEn || item.titleEn || item.titleAr,
    titleTr: titleTr || item.titleTr || item.titleAr,
    descEn: descEn || item.descEn || item.descAr,
    descTr: descTr || item.descTr || item.descAr,
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
    whyBadgeEn, whyBadgeTr,
    whyHeadingEn, whyHeadingTr,
    whySubtitleEn, whySubtitleTr,
    addressEn, addressTr,
    countryEn, countryTr,
    cityEn, cityTr,
    workingHoursEn, workingHoursTr,
    navbarSubtitleEn, navbarSubtitleTr,
    recoveredCapitalTextEn, recoveredCapitalTextTr,
    whyPillarsTranslated
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
    smartTranslateField(settings.whyBadgeAr, prev?.whyBadgeAr, settings.whyBadgeEn, 'en', forceAll),
    smartTranslateField(settings.whyBadgeAr, prev?.whyBadgeAr, settings.whyBadgeTr, 'tr', forceAll),
    smartTranslateField(settings.whyHeadingAr, prev?.whyHeadingAr, settings.whyHeadingEn, 'en', forceAll),
    smartTranslateField(settings.whyHeadingAr, prev?.whyHeadingAr, settings.whyHeadingTr, 'tr', forceAll),
    smartTranslateField(settings.whySubtitleAr, prev?.whySubtitleAr, settings.whySubtitleEn, 'en', forceAll),
    smartTranslateField(settings.whySubtitleAr, prev?.whySubtitleAr, settings.whySubtitleTr, 'tr', forceAll),
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
    smartTranslateField(settings.stats?.recoveredCapitalTextAr, prev?.stats?.recoveredCapitalTextAr, settings.stats?.recoveredCapitalTextEn, 'en', forceAll),
    smartTranslateField(settings.stats?.recoveredCapitalTextAr, prev?.stats?.recoveredCapitalTextAr, settings.stats?.recoveredCapitalTextTr, 'tr', forceAll),
    Array.isArray(settings.whyPillars) && settings.whyPillars.length > 0
      ? Promise.all(
          settings.whyPillars.map((pillar) => {
            const prevPillar = prev?.whyPillars?.find((p) => p.id === pillar.id);
            return autoTranslateWhyPillar(pillar, prevPillar, forceAll);
          })
        )
      : Promise.resolve(settings.whyPillars),
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
    whyBadgeEn: whyBadgeEn || settings.whyBadgeEn || settings.whyBadgeAr,
    whyBadgeTr: whyBadgeTr || settings.whyBadgeTr || settings.whyBadgeAr,
    whyHeadingEn: whyHeadingEn || settings.whyHeadingEn || settings.whyHeadingAr,
    whyHeadingTr: whyHeadingTr || settings.whyHeadingTr || settings.whyHeadingAr,
    whySubtitleEn: whySubtitleEn || settings.whySubtitleEn || settings.whySubtitleAr,
    whySubtitleTr: whySubtitleTr || settings.whySubtitleTr || settings.whySubtitleAr,
    whyPillars: whyPillarsTranslated || settings.whyPillars,
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
    stats: {
      ...settings.stats,
      recoveredCapitalTextEn: recoveredCapitalTextEn || settings.stats?.recoveredCapitalTextEn,
      recoveredCapitalTextTr: recoveredCapitalTextTr || settings.stats?.recoveredCapitalTextTr,
    },
  };
}

/**
 * Translate the ENTIRE database (Partners, Practices, Cases, Testimonials, Blog, Offices, Settings)
 */
export async function autoTranslateAllSiteData(
  onProgress?: (percent: number, currentTask: string) => void,
  forceAll = false
): Promise<{ totalCount: number }> {
  const { storageService } = await import('./storageService');
  let count = 0;

  // 1. Settings
  onProgress?.(10, 'جاري ترجمة إعدادات وهوية الموقع...');
  const currentSettings = storageService.getSettings();
  const updatedSettings = await autoTranslateSettings(currentSettings, null, forceAll);
  storageService.saveSettings(updatedSettings);
  count++;

  // 2. Partners
  onProgress?.(25, 'جاري ترجمة بيانات الشركاء والمحامين...');
  const partners = storageService.getPartners();
  for (const p of partners) {
    const updated = await autoTranslatePartner(p, null, forceAll);
    storageService.savePartner(updated);
    count++;
  }

  // 3. Practice Areas
  onProgress?.(45, 'جاري ترجمة مجالات الاختصاص والخدمات...');
  const practices = storageService.getPracticeAreas();
  for (const pr of practices) {
    const updated = await autoTranslatePracticeArea(pr, null, forceAll);
    storageService.savePracticeArea(updated);
    count++;
  }

  // 4. Case Studies
  onProgress?.(60, 'جاري ترجمة الإنجازات والصفقات...');
  const cases = storageService.getCaseStudies();
  for (const c of cases) {
    const updated = await autoTranslateCaseStudy(c, null, forceAll);
    storageService.saveCaseStudy(updated);
    count++;
  }

  // 5. Testimonials
  onProgress?.(75, 'جاري ترجمة آراء وشهادات العملاء...');
  const testimonials = storageService.getTestimonials();
  for (const t of testimonials) {
    const updated = await autoTranslateTestimonial(t, null, forceAll);
    storageService.saveTestimonial(updated);
    count++;
  }

  // 6. Blog Posts
  onProgress?.(85, 'جاري ترجمة المقالات والتحليلات...');
  const blogs = storageService.getBlogPosts();
  for (const b of blogs) {
    const updated = await autoTranslateBlogPost(b, null, forceAll);
    storageService.saveBlogPost(updated);
    count++;
  }

  // 7. Offices
  onProgress?.(95, 'جاري ترجمة مقار المكاتب الدولية...');
  const offices = storageService.getOffices();
  for (const off of offices) {
    const updated = await autoTranslateOffice(off, null, forceAll);
    storageService.saveOffice(updated);
    count++;
  }

  onProgress?.(100, 'اكتملت الترجمة والمزامنة الشاملة بنجاح!');
  return { totalCount: count };
}
