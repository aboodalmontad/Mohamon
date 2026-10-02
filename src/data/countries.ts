export interface CountryOption {
  ar: string;
  en: string;
  tr?: string;
  flag?: string;
  defaultCityAr?: string;
  defaultCityEn?: string;
  nameAr: string;
  nameEn: string;
  code: string;
}

export const COUNTRIES_LIST: CountryOption[] = [
  // Arab Countries
  { ar: 'المملكة العربية السعودية', en: 'Saudi Arabia', tr: 'Suudi Arabistan', flag: '🇸🇦', defaultCityAr: 'الرياض', defaultCityEn: 'Riyadh', nameAr: 'المملكة العربية السعودية', nameEn: 'Saudi Arabia', code: 'SA' },
  { ar: 'الإمارات العربية المتحدة', en: 'United Arab Emirates', tr: 'Birleşik Arap Emirlikleri', flag: '🇦🇪', defaultCityAr: 'دبي', defaultCityEn: 'Dubai', nameAr: 'الإمارات العربية المتحدة', nameEn: 'United Arab Emirates', code: 'AE' },
  { ar: 'مصر', en: 'Egypt', tr: 'Mısır', flag: '🇪🇬', defaultCityAr: 'القاهرة', defaultCityEn: 'Cairo', nameAr: 'مصر', nameEn: 'Egypt', code: 'EG' },
  { ar: 'الكويت', en: 'Kuwait', tr: 'Kuveyt', flag: '🇰🇼', defaultCityAr: 'مدينة الكويت', defaultCityEn: 'Kuwait City', nameAr: 'الكويت', nameEn: 'Kuwait', code: 'KW' },
  { ar: 'قطر', en: 'Qatar', tr: 'Katar', flag: '🇶🇦', defaultCityAr: 'الدوحة', defaultCityEn: 'Doha', nameAr: 'قطر', nameEn: 'Qatar', code: 'QA' },
  { ar: 'سلطنة عمان', en: 'Oman', tr: 'Umman', flag: '🇴🇲', defaultCityAr: 'مسقط', defaultCityEn: 'Muscat', nameAr: 'سلطنة عمان', nameEn: 'Oman', code: 'OM' },
  { ar: 'البحرين', en: 'Bahrain', tr: 'Bahreyn', flag: '🇧🇭', defaultCityAr: 'المنامة', defaultCityEn: 'Manama', nameAr: 'البحرين', nameEn: 'Bahrain', code: 'BH' },
  { ar: 'الأردن', en: 'Jordan', tr: 'Ürdün', flag: '🇯🇴', defaultCityAr: 'عمان', defaultCityEn: 'Amman', nameAr: 'الأردن', nameEn: 'Jordan', code: 'JO' },
  { ar: 'المغرب', en: 'Morocco', tr: 'Fas', flag: '🇲🇦', defaultCityAr: 'الدار البيضاء', defaultCityEn: 'Casablanca', nameAr: 'المغرب', nameEn: 'Morocco', code: 'MA' },
  { ar: 'تونس', en: 'Tunisia', tr: 'Tunus', flag: '🇹🇳', defaultCityAr: 'تونس العاصمة', defaultCityEn: 'Tunis', nameAr: 'تونس', nameEn: 'Tunisia', code: 'TN' },
  { ar: 'الجزائر', en: 'Algeria', tr: 'Cezayir', flag: '🇩🇿', defaultCityAr: 'الجزائر العاصمة', defaultCityEn: 'Algiers', nameAr: 'الجزائر', nameEn: 'Algeria', code: 'DZ' },
  { ar: 'العراق', en: 'Iraq', tr: 'Irak', flag: '🇮🇶', defaultCityAr: 'بغداد', defaultCityEn: 'Baghdad', nameAr: 'العراق', nameEn: 'Iraq', code: 'IQ' },
  { ar: 'لبنان', en: 'Lebanon', tr: 'Lübnan', flag: '🇱🇧', defaultCityAr: 'بيروت', defaultCityEn: 'Beirut', nameAr: 'لبنان', nameEn: 'Lebanon', code: 'LB' },
  { ar: 'فلسطين', en: 'Palestine', tr: 'Filistin', flag: '🇵🇸', defaultCityAr: 'القدس', defaultCityEn: 'Jerusalem', nameAr: 'فلسطين', nameEn: 'Palestine', code: 'PS' },
  { ar: 'ليبيا', en: 'Libya', tr: 'Libya', flag: '🇱🇾', defaultCityAr: 'طرابلس', defaultCityEn: 'Tripoli', nameAr: 'ليبيا', nameEn: 'Libya', code: 'LY' },
  { ar: 'السودان', en: 'Sudan', tr: 'Sudan', flag: '🇸🇩', defaultCityAr: 'الخرطوم', defaultCityEn: 'Khartoum', nameAr: 'السودان', nameEn: 'Sudan', code: 'SD' },
  { ar: 'موريتانيا', en: 'Mauritania', tr: 'Moritanya', flag: '🇲🇷', defaultCityAr: 'نواكشوط', defaultCityEn: 'Nouakchott', nameAr: 'موريتانيا', nameEn: 'Mauritania', code: 'MR' },
  { ar: 'سوريا', en: 'Syria', tr: 'Suriye', flag: '🇸🇾', defaultCityAr: 'دمشق', defaultCityEn: 'Damascus', nameAr: 'سوريا', nameEn: 'Syria', code: 'SY' },
  { ar: 'اليمن', en: 'Yemen', tr: 'Yemen', flag: '🇾🇪', defaultCityAr: 'صنعاء', defaultCityEn: 'Sana\'a', nameAr: 'اليمن', nameEn: 'Yemen', code: 'YE' },
  { ar: 'الصومال', en: 'Somalia', tr: 'Somali', flag: '🇸🇴', defaultCityAr: 'مقديشو', defaultCityEn: 'Mogadishu', nameAr: 'الصومال', nameEn: 'Somalia', code: 'SO' },
  { ar: 'جيبوتي', en: 'Djibouti', tr: 'Cibuti', flag: '🇩🇯', defaultCityAr: 'جيبوتي', defaultCityEn: 'Djibouti', nameAr: 'جيبوتي', nameEn: 'Djibouti', code: 'DJ' },
  { ar: 'جزر القمر', en: 'Comoros', tr: 'Komorlar', flag: '🇰🇲', defaultCityAr: 'موروني', defaultCityEn: 'Moroni', nameAr: 'جزر القمر', nameEn: 'Comoros', code: 'KM' },

  // Regional & International
  { ar: 'تركيا', en: 'Turkey', tr: 'Türkiye', flag: '🇹🇷', defaultCityAr: 'إسطنبول', defaultCityEn: 'Istanbul', nameAr: 'تركيا', nameEn: 'Turkey', code: 'TR' },
  { ar: 'الولايات المتحدة الأمريكية', en: 'United States', tr: 'Amerika Birleşik Devletleri', flag: '🇺🇸', defaultCityAr: 'واشنطن', defaultCityEn: 'Washington', nameAr: 'الولايات المتحدة الأمريكية', nameEn: 'United States', code: 'US' },
  { ar: 'المملكة المتحدة', en: 'United Kingdom', tr: 'Birleşik Krallık', flag: '🇬🇧', defaultCityAr: 'لندن', defaultCityEn: 'London', nameAr: 'المملكة المتحدة', nameEn: 'United Kingdom', code: 'GB' },
  { ar: 'فرنسا', en: 'France', tr: 'Fransa', flag: '🇫🇷', defaultCityAr: 'باريس', defaultCityEn: 'Paris', nameAr: 'فرنسا', nameEn: 'France', code: 'FR' },
  { ar: 'ألمانيا', en: 'Germany', tr: 'Almanya', flag: '🇩🇪', defaultCityAr: 'برلين', defaultCityEn: 'Berlin', nameAr: 'ألمانيا', nameEn: 'Germany', code: 'DE' },
  { ar: 'إسبانيا', en: 'Spain', tr: 'İspanya', flag: '🇪🇸', defaultCityAr: 'مدريد', defaultCityEn: 'Madrid', nameAr: 'إسبانيا', nameEn: 'Spain', code: 'ES' },
  { ar: 'إيطاليا', en: 'Italy', tr: 'İtalya', flag: '🇮🇹', defaultCityAr: 'روما', defaultCityEn: 'Rome', nameAr: 'إيطاليا', nameEn: 'Italy', code: 'IT' },
  { ar: 'كندا', en: 'Canada', tr: 'Kanada', flag: '🇨🇦', defaultCityAr: 'أوتاوا', defaultCityEn: 'Ottawa', nameAr: 'كندا', nameEn: 'Canada', code: 'CA' },
  { ar: 'أستراليا', en: 'Australia', tr: 'Avustralya', flag: '🇦🇺', defaultCityAr: 'كانبيرا', defaultCityEn: 'Canberra', nameAr: 'أستراليا', nameEn: 'Australia', code: 'AU' },
  { ar: 'اليابان', en: 'Japan', tr: 'Japonya', flag: '🇯🇵', defaultCityAr: 'طوكيو', defaultCityEn: 'Tokyo', nameAr: 'اليابان', nameEn: 'Japan', code: 'JP' },
  { ar: 'كوريا الجنوبية', en: 'South Korea', tr: 'Güney Kore', flag: '🇰🇷', defaultCityAr: 'سيول', defaultCityEn: 'Seoul', nameAr: 'كوريا الجنوبية', nameEn: 'South Korea', code: 'KR' },
  { ar: 'الصين', en: 'China', tr: 'Çin', flag: '🇨🇳', defaultCityAr: 'بكين', defaultCityEn: 'Beijing', nameAr: 'الصين', nameEn: 'China', code: 'CN' },
  { ar: 'الهند', en: 'India', tr: 'Hindistan', flag: '🇮🇳', defaultCityAr: 'نيودلهي', defaultCityEn: 'New Delhi', nameAr: 'الهند', nameEn: 'India', code: 'IN' },
  { ar: 'روسيا', en: 'Russia', tr: 'Rusya', flag: '🇷🇺', defaultCityAr: 'موسكو', defaultCityEn: 'Moscow', nameAr: 'روسيا', nameEn: 'Russia', code: 'RU' },
  { ar: 'البرازيل', en: 'Brazil', tr: 'Brezilya', flag: '🇧🇷', defaultCityAr: 'برازيليا', defaultCityEn: 'Brasilia', nameAr: 'البرازيل', nameEn: 'Brazil', code: 'BR' },
  { ar: 'جنوب أفريقيا', en: 'South Africa', tr: 'Güney Afrika', flag: '🇿🇦', defaultCityAr: 'بريتوريا', defaultCityEn: 'Pretoria', nameAr: 'جنوب أفريقيا', nameEn: 'South Africa', code: 'ZA' },
  { ar: 'سويسرا', en: 'Switzerland', tr: 'İsviçre', flag: '🇨🇭', defaultCityAr: 'برن', defaultCityEn: 'Bern', nameAr: 'سويسرا', nameEn: 'Switzerland', code: 'CH' },
  { ar: 'السويد', en: 'Sweden', tr: 'İsveç', flag: '🇸🇪', defaultCityAr: 'ستوكهولم', defaultCityEn: 'Stockholm', nameAr: 'السويد', nameEn: 'Sweden', code: 'SE' },
  { ar: 'هولندا', en: 'Netherlands', tr: 'Hollanda', flag: '🇳🇱', defaultCityAr: 'أمستردام', defaultCityEn: 'Amsterdam', nameAr: 'هولندا', nameEn: 'Netherlands', code: 'NL' },
  { ar: 'بلجيكا', en: 'Belgium', tr: 'Belçika', flag: '🇧🇪', defaultCityAr: 'بروكسل', defaultCityEn: 'Brussels', nameAr: 'بلجيكا', nameEn: 'Belgium', code: 'BE' },
  { ar: 'النمسا', en: 'Austria', tr: 'Avusturya', flag: '🇦🇹', defaultCityAr: 'فيينا', defaultCityEn: 'Vienna', nameAr: 'النمسا', nameEn: 'Austria', code: 'AT' },
  { ar: 'اليونان', en: 'Greece', tr: 'Yunanistan', flag: '🇬🇷', defaultCityAr: 'أثينا', defaultCityEn: 'Athens', nameAr: 'اليونان', nameEn: 'Greece', code: 'GR' },
  { ar: 'سنغافورة', en: 'Singapore', tr: 'Singapur', flag: '🇸🇬', defaultCityAr: 'سنغافورة', defaultCityEn: 'Singapore', nameAr: 'سنغافورة', nameEn: 'Singapore', code: 'SG' },
  { ar: 'ماليزيا', en: 'Malaysia', tr: 'Malezya', flag: '🇲🇾', defaultCityAr: 'كوالالمبور', defaultCityEn: 'Kuala Lumpur', nameAr: 'ماليزيا', nameEn: 'Malaysia', code: 'MY' },
  { ar: 'إندونيسيا', en: 'Indonesia', tr: 'Endonezya', flag: '🇮🇩', defaultCityAr: 'جاكرتا', defaultCityEn: 'Jakarta', nameAr: 'إندونيسيا', nameEn: 'Indonesia', code: 'ID' },
  { ar: 'باكستان', en: 'Pakistan', tr: 'Pakistan', flag: '🇵🇰', defaultCityAr: 'إسلام آباد', defaultCityEn: 'Islamabad', nameAr: 'باكستان', nameEn: 'Pakistan', code: 'PK' },
  { ar: 'بنغلاديش', en: 'Bangladesh', tr: 'Bangladeş', flag: '🇧🇩', defaultCityAr: 'دكا', defaultCityEn: 'Dhaka', nameAr: 'بنغلاديش', nameEn: 'Bangladesh', code: 'BD' },
  { ar: 'إيران', en: 'Iran', tr: 'İran', flag: '🇮🇷', defaultCityAr: 'طهران', defaultCityEn: 'Tehran', nameAr: 'إيران', nameEn: 'Iran', code: 'IR' },
  { ar: 'المكسيك', en: 'Mexico', tr: 'Meksika', flag: '🇲🇽', defaultCityAr: 'مكسيكو سيتي', defaultCityEn: 'Mexico City', nameAr: 'المكسيك', nameEn: 'Mexico', code: 'MX' },
  { ar: 'الأرجنتين', en: 'Argentina', tr: 'Arjantin', flag: '🇦🇷', defaultCityAr: 'بوينس آيرس', defaultCityEn: 'Buenos Aires', nameAr: 'الأرجنتين', nameEn: 'Argentina', code: 'AR' },
  { ar: 'تشيلي', en: 'Chile', tr: 'Şili', flag: '🇨🇱', defaultCityAr: 'سانتياغو', defaultCityEn: 'Santiago', nameAr: 'تشيلي', nameEn: 'Chile', code: 'CL' },
  { ar: 'كولومبيا', en: 'Colombia', tr: 'Kolombiya', flag: '🇨🇴', defaultCityAr: 'بوغوتا', defaultCityEn: 'Bogota', nameAr: 'كولومبيا', nameEn: 'Colombia', code: 'CO' },
  { ar: 'نيوزيلندا', en: 'New Zealand', tr: 'Yeni Zelanda', flag: '🇳🇿', defaultCityAr: 'ويلينغتون', defaultCityEn: 'Wellington', nameAr: 'نيوزيلندا', nameEn: 'New Zealand', code: 'NZ' },
  { ar: 'أيرلندا', en: 'Ireland', tr: 'İrlanda', flag: '🇮🇪', defaultCityAr: 'دبلن', defaultCityEn: 'Dublin', nameAr: 'أيرلندا', nameEn: 'Ireland', code: 'IE' },
  { ar: 'النرويج', en: 'Norway', tr: 'Norveç', flag: '🇳🇴', defaultCityAr: 'أوسلو', defaultCityEn: 'Oslo', nameAr: 'النرويج', nameEn: 'Norway', code: 'NO' },
  { ar: 'الدنمارك', en: 'Denmark', tr: 'Danimarka', flag: '🇩🇰', defaultCityAr: 'كوبنهاغن', defaultCityEn: 'Copenhagen', nameAr: 'الدنمارك', nameEn: 'Denmark', code: 'DK' },
  { ar: 'فنلندا', en: 'Finland', tr: 'Finlandiya', flag: '🇫🇮', defaultCityAr: 'هلسنكي', defaultCityEn: 'Helsinki', nameAr: 'فنلندا', nameEn: 'Finland', code: 'FI' },
  { ar: 'البرتغال', en: 'Portugal', tr: 'Portekiz', flag: '🇵🇹', defaultCityAr: 'لشبونة', defaultCityEn: 'Lisbon', nameAr: 'البرتغال', nameEn: 'Portugal', code: 'PT' },
  { ar: 'بولندا', en: 'Poland', tr: 'Polonya', flag: '🇵🇱', defaultCityAr: 'وارسو', defaultCityEn: 'Warsaw', nameAr: 'بولندا', nameEn: 'Poland', code: 'PL' },
  { ar: 'أوكرانيا', en: 'Ukraine', tr: 'Ukrayna', flag: '🇺🇦', defaultCityAr: 'كييف', defaultCityEn: 'Kyiv', nameAr: 'أوكرانيا', nameEn: 'Ukraine', code: 'UA' },
  { ar: 'رومانيا', en: 'Romania', tr: 'Romanya', flag: '🇷🇴', defaultCityAr: 'بوخارست', defaultCityEn: 'Bucharest', nameAr: 'رومانيا', nameEn: 'Romania', code: 'RO' },
  { ar: 'المجر', en: 'Hungary', tr: 'Macaristan', flag: '🇭🇺', defaultCityAr: 'بودابست', defaultCityEn: 'Budapest', nameAr: 'المجر', nameEn: 'Hungary', code: 'HU' },
  { ar: 'جمهورية التشيك', en: 'Czech Republic', tr: 'Çekya', flag: '🇨🇿', defaultCityAr: 'براغ', defaultCityEn: 'Prague', nameAr: 'جمهورية التشيك', nameEn: 'Czech Republic', code: 'CZ' },
  { ar: 'فيتنام', en: 'Vietnam', tr: 'Vietnam', flag: '🇻🇳', defaultCityAr: 'هانوي', defaultCityEn: 'Hanoi', nameAr: 'فيتنام', nameEn: 'Vietnam', code: 'VN' },
  { ar: 'الفلبين', en: 'Philippines', tr: 'Filipinler', flag: '🇵🇭', defaultCityAr: 'مانيلا', defaultCityEn: 'Manila', nameAr: 'الفلبين', nameEn: 'Philippines', code: 'PH' },
  { ar: 'تايلاند', en: 'Thailand', tr: 'Tayland', flag: '🇹🇭', defaultCityAr: 'بانكوك', defaultCityEn: 'Bangkok', nameAr: 'تايلاند', nameEn: 'Thailand', code: 'TH' },
  { ar: 'نيجيريا', en: 'Nigeria', tr: 'Nijerya', flag: '🇳🇬', defaultCityAr: 'أبوجا', defaultCityEn: 'Abuja', nameAr: 'نيجيريا', nameEn: 'Nigeria', code: 'NG' },
  { ar: 'كينيا', en: 'Kenya', tr: 'Kenya', flag: '🇰🇪', defaultCityAr: 'نيروبي', defaultCityEn: 'Nairobi', nameAr: 'كينيا', nameEn: 'Kenya', code: 'KE' },
  { ar: 'إثيوبيا', en: 'Ethiopia', tr: 'Etiyopya', flag: '🇪🇹', defaultCityAr: 'أديس أبابا', defaultCityEn: 'Addis Ababa', nameAr: 'إثيوبيا', nameEn: 'Ethiopia', code: 'ET' },
  { ar: 'غانا', en: 'Ghana', tr: 'Gana', flag: 'GH', defaultCityAr: 'أكرا', defaultCityEn: 'Accra', nameAr: 'غانا', nameEn: 'Ghana', code: 'GH' }
];
