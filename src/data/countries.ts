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
  { ar: 'الجزائر', en: 'Algeria', tr: 'Cezayir', flag: '🇩🇿', defaultCityAr: 'الجزائر العاصمة', defaultCityEn: 'Algiers', nameAr: 'الجزائر', nameEn: 'Algeria', code: 'DZ' },
  { ar: 'المملكة العربية السعودية', en: 'Saudi Arabia', tr: 'Suudi Arabistan', flag: '🇸🇦', defaultCityAr: 'الرياض', defaultCityEn: 'Riyadh', nameAr: 'المملكة العربية السعودية', nameEn: 'Saudi Arabia', code: 'SA' },
  { ar: 'الإمارات العربية المتحدة', en: 'United Arab Emirates', tr: 'Birleşik Arap Emirlikleri', flag: '🇦🇪', defaultCityAr: 'دبي', defaultCityEn: 'Dubai', nameAr: 'الإمارات العربية المتحدة', nameEn: 'United Arab Emirates', code: 'AE' },
  { ar: 'مصر', en: 'Egypt', tr: 'Mısır', flag: '🇪🇬', defaultCityAr: 'القاهرة', defaultCityEn: 'Cairo', nameAr: 'مصر', nameEn: 'Egypt', code: 'EG' },
  { ar: 'المغرب', en: 'Morocco', tr: 'Fas', flag: '🇲🇦', defaultCityAr: 'الدار البيضاء', defaultCityEn: 'Casablanca', nameAr: 'المغرب', nameEn: 'Morocco', code: 'MA' },
  { ar: 'تونس', en: 'Tunisia', tr: 'Tunus', flag: '🇹🇳', defaultCityAr: 'تونس العاصمة', defaultCityEn: 'Tunis', nameAr: 'تونس', nameEn: 'Tunisia', code: 'TN' },
  { ar: 'الكويت', en: 'Kuwait', tr: 'Kuveyt', flag: '🇰🇼', defaultCityAr: 'مدينة الكويت', defaultCityEn: 'Kuwait City', nameAr: 'الكويت', nameEn: 'Kuwait', code: 'KW' },
  { ar: 'قطر', en: 'Qatar', tr: 'Katar', flag: '🇶🇦', defaultCityAr: 'الدوحة', defaultCityEn: 'Doha', nameAr: 'قطر', nameEn: 'Qatar', code: 'QA' },
  { ar: 'سلطنة عمان', en: 'Oman', tr: 'Umman', flag: '🇴🇲', defaultCityAr: 'مسقط', defaultCityEn: 'Muscat', nameAr: 'سلطنة عمان', nameEn: 'Oman', code: 'OM' },
  { ar: 'البحرين', en: 'Bahrain', tr: 'Bahreyn', flag: '🇧🇭', defaultCityAr: 'المنامة', defaultCityEn: 'Manama', nameAr: 'البحرين', nameEn: 'Bahrain', code: 'BH' },
  { ar: 'الأردن', en: 'Jordan', tr: 'Ürdün', flag: '🇯🇴', defaultCityAr: 'عمان', defaultCityEn: 'Amman', nameAr: 'الأردن', nameEn: 'Jordan', code: 'JO' },
  { ar: 'لبنان', en: 'Lebanon', tr: 'Lübnan', flag: '🇱🇧', defaultCityAr: 'بيروت', defaultCityEn: 'Beirut', nameAr: 'لبنان', nameEn: 'Lebanon', code: 'LB' },
  { ar: 'العراق', en: 'Iraq', tr: 'Irak', flag: '🇮🇶', defaultCityAr: 'بغداد', defaultCityEn: 'Baghdad', nameAr: 'العراق', nameEn: 'Iraq', code: 'IQ' },
  { ar: 'فلسطين', en: 'Palestine', tr: 'Filistin', flag: '🇵🇸', defaultCityAr: 'القدس', defaultCityEn: 'Jerusalem', nameAr: 'فلسطين', nameEn: 'Palestine', code: 'PS' },
  { ar: 'ليبيا', en: 'Libya', tr: 'Libya', flag: '🇱🇾', defaultCityAr: 'طرابلس', defaultCityEn: 'Tripoli', nameAr: 'ليبيا', nameEn: 'Libya', code: 'LY' },
  { ar: 'السودان', en: 'Sudan', tr: 'Sudan', flag: '🇸🇩', defaultCityAr: 'الخرطوم', defaultCityEn: 'Khartoum', nameAr: 'السودان', nameEn: 'Sudan', code: 'SD' },
  { ar: 'موريتانيا', en: 'Mauritania', tr: 'Moritanya', flag: '🇲🇷', defaultCityAr: 'نواكشوط', defaultCityEn: 'Nouakchott', nameAr: 'موريتانيا', nameEn: 'Mauritania', code: 'MR' },
  { ar: 'تركيا', en: 'Turkey', tr: 'Türkiye', flag: '🇹🇷', defaultCityAr: 'إسطنبول', defaultCityEn: 'Istanbul', nameAr: 'تركيا', nameEn: 'Turkey', code: 'TR' },
  { ar: 'فرنسا', en: 'France', tr: 'Fransa', flag: '🇫🇷', defaultCityAr: 'باريس', defaultCityEn: 'Paris', nameAr: 'فرنسا', nameEn: 'France', code: 'FR' },
  { ar: 'المملكة المتحدة', en: 'United Kingdom', tr: 'Birleşik Krallık', flag: '🇬🇧', defaultCityAr: 'لندن', defaultCityEn: 'London', nameAr: 'المملكة المتحدة', nameEn: 'United Kingdom', code: 'GB' },
  { ar: 'الولايات المتحدة الأمريكية', en: 'United States', tr: 'Amerika Birleşik Devletleri', flag: '🇺🇸', defaultCityAr: 'واشنطن / نيويورك', defaultCityEn: 'Washington / New York', nameAr: 'الولايات المتحدة الأمريكية', nameEn: 'United States', code: 'US' },
  { ar: 'ألمانيا', en: 'Germany', tr: 'Almanya', flag: '🇩🇪', defaultCityAr: 'برلين', defaultCityEn: 'Berlin', nameAr: 'ألمانيا', nameEn: 'Germany', code: 'DE' },
  { ar: 'إسبانيا', en: 'Spain', tr: 'İspanya', flag: '🇪🇸', defaultCityAr: 'مدريد', defaultCityEn: 'Madrid', nameAr: 'إسبانيا', nameEn: 'Spain', code: 'ES' },
  { ar: 'كندا', en: 'Canada', tr: 'Kanada', flag: '🇨🇦', defaultCityAr: 'أوتاوا / تورونتو', defaultCityEn: 'Ottawa / Toronto', nameAr: 'كندا', nameEn: 'Canada', code: 'CA' },
];

