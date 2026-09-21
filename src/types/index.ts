export type Language = 'ar' | 'en' | 'tr';

export interface Partner {
  id: string;
  name: string;
  nameEn: string;
  nameTr?: string;
  title: string;
  titleEn: string;
  titleTr?: string;
  specialty: string;
  specialtyEn: string;
  specialtyTr?: string;
  experienceYears: number;
  education: string[];
  educationEn?: string[];
  educationTr?: string[];
  bio: string;
  bioEn: string;
  bioTr?: string;
  email: string;
  phone: string;
  linkedin: string;
  image: string;
  featured: boolean;
  barAdmission: string;
  barAdmissionEn?: string;
  barAdmissionTr?: string;
  languages: string[];
  casesWonCount?: number;
  isPartner?: boolean; // true for equity/senior/junior partners, false for non-partner associate lawyers & counsel
  roleCategory?: 'senior_partner' | 'managing_partner' | 'partner' | 'counsel' | 'associate' | 'legal_consultant' | 'trainee';
}

export interface PracticeArea {
  id: string;
  title: string;
  titleEn: string;
  titleTr?: string;
  category: string; // 'corporate' | 'disputes' | 'finance' | 'technology' | 'realestate' | 'labor' | 'tax' | 'general' | custom string
  categoryLabelAr?: string;
  categoryLabelEn?: string;
  categoryLabelTr?: string;
  iconName: string;
  shortDesc: string;
  shortDescEn: string;
  shortDescTr?: string;
  fullDesc: string;
  fullDescEn: string;
  fullDescTr?: string;
  keyServices: string[];
  keyServicesEn: string[];
  keyServicesTr?: string[];
  casesCount: number;
  image: string;
  leadPartnerId?: string;
}

export interface Testimonial {
  id: string;
  clientName: string;
  clientNameEn: string;
  clientNameTr?: string;
  clientRole: string;
  clientRoleEn: string;
  clientRoleTr?: string;
  company: string;
  companyEn: string;
  companyTr?: string;
  content: string;
  contentEn: string;
  contentTr?: string;
  rating: number;
  avatar: string;
  caseType: string;
  caseTypeEn?: string;
  caseTypeTr?: string;
  year: string;
}

export interface CaseStudy {
  id: string;
  title: string;
  titleEn: string;
  titleTr?: string;
  category: string;
  categoryEn?: string;
  categoryTr?: string;
  outcome: string;
  outcomeEn?: string;
  outcomeTr?: string;
  summary: string;
  summaryEn?: string;
  summaryTr?: string;
  year: string;
  value?: string;
  highlight: string;
  highlightEn?: string;
  highlightTr?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  titleEn: string;
  titleTr?: string;
  slug: string;
  slugEn?: string;
  slugTr?: string;
  category: string;
  categoryEn?: string;
  categoryTr?: string;
  excerpt: string;
  excerptEn?: string;
  excerptTr?: string;
  content: string;
  contentEn?: string;
  contentTr?: string;
  authorName: string;
  authorNameEn?: string;
  authorNameTr?: string;
  authorRole: string;
  authorRoleEn?: string;
  authorRoleTr?: string;
  date: string;
  dateEn?: string;
  dateTr?: string;
  readTime: string;
  readTimeEn?: string;
  readTimeTr?: string;
  image: string;
  tags: string[];
  tagsEn?: string[];
  tagsTr?: string[];
}

export interface ContactMessage {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  company?: string;
  consultationType: string;
  preferredDate?: string;
  isUrgent: boolean;
  message: string;
  status: 'new' | 'contacted' | 'scheduled' | 'closed';
  createdAt: string;
  responseNote?: string;
}

export interface PlatformSettings {
  platformNameAr: string;
  platformNameEn: string;
  platformNameTr?: string;
  heroBadgeAr: string;
  heroBadgeEn: string;
  heroBadgeTr?: string;
  heroHeadingAr: string;
  heroHeadingEn: string;
  heroHeadingTr?: string;
  heroSubheadingAr: string;
  heroSubheadingEn: string;
  heroSubheadingTr?: string;
  heroBannerUrl?: string;
  ctaPrimaryAr: string;
  ctaPrimaryEn: string;
  ctaPrimaryTr?: string;
  ctaSecondaryAr: string;
  ctaSecondaryEn: string;
  ctaSecondaryTr?: string;
}

export interface SiteSettings {
  firmNameAr: string;
  firmNameEn: string;
  firmNameTr?: string;
  sloganAr: string;
  sloganEn: string;
  sloganTr?: string;
  subSloganAr: string;
  subSloganEn: string;
  subSloganTr?: string;
  aboutTextAr: string;
  aboutTextEn: string;
  aboutTextTr?: string;
  aboutHeadingAr?: string;
  aboutHeadingEn?: string;
  aboutHeadingTr?: string;
  aboutBadgeAr?: string;
  aboutBadgeEn?: string;
  aboutBadgeTr?: string;
  aboutVisionAr?: string;
  aboutVisionEn?: string;
  aboutVisionTr?: string;
  aboutMethodologyAr?: string;
  aboutMethodologyEn?: string;
  aboutMethodologyTr?: string;
  aboutConfidentialityAr?: string;
  aboutConfidentialityEn?: string;
  aboutConfidentialityTr?: string;
  aboutVisionPoint1Ar?: string;
  aboutVisionPoint1En?: string;
  aboutVisionPoint1Tr?: string;
  aboutVisionPoint2Ar?: string;
  aboutVisionPoint2En?: string;
  aboutVisionPoint2Tr?: string;
  aboutMethodologyPoint1Ar?: string;
  aboutMethodologyPoint1En?: string;
  aboutMethodologyPoint1Tr?: string;
  aboutMethodologyPoint2Ar?: string;
  aboutMethodologyPoint2En?: string;
  aboutMethodologyPoint2Tr?: string;
  aboutConfidentialityPoint1Ar?: string;
  aboutConfidentialityPoint1En?: string;
  aboutConfidentialityPoint1Tr?: string;
  aboutConfidentialityPoint2Ar?: string;
  aboutConfidentialityPoint2En?: string;
  aboutConfidentialityPoint2Tr?: string;
  aboutRankingTitleAr?: string;
  aboutRankingTitleEn?: string;
  aboutRankingTitleTr?: string;
  aboutRankingDescAr?: string;
  aboutRankingDescEn?: string;
  aboutRankingDescTr?: string;
  aboutImageUrl?: string;
  aboutCtaTextAr?: string;
  aboutCtaTextEn?: string;
  aboutCtaTextTr?: string;
  phone: string;
  emergencyPhone: string;
  email: string;
  consultationEmail: string;
  addressAr: string;
  addressEn: string;
  addressTr?: string;
  countryAr?: string;
  countryEn?: string;
  countryTr?: string;
  cityAr?: string;
  cityEn?: string;
  cityTr?: string;
  workingHoursAr: string;
  workingHoursEn: string;
  workingHoursTr?: string;
  stats: {
    yearsExperience: number;
    casesWon: number;
    activeClients: number;
    successRate: number;
    recoveredMillionsUSD: number;
  };
  socialLinks: {
    linkedin: string;
    twitter: string;
    youtube: string;
  };
  customLogoUrl?: string;
  logoIcon?: string;
  
  // Visual Branding & Layout Customization
  logoSizeNavbar?: 'sm' | 'md' | 'lg' | 'xl';
  logoSizeHero?: 'sm' | 'md' | 'lg' | 'xl' | 'hidden';
  logoShape?: 'rounded' | 'circle' | 'square' | 'transparent';
  brandingLayout?: 'horizontal' | 'vertical';
  brandingPositionNavbar?: 'start' | 'center';
  firmNameSizeNavbar?: 'sm' | 'md' | 'lg' | 'xl';
  firmNameWeightNavbar?: 'normal' | 'semibold' | 'bold' | 'extrabold';
  firmNameLinesNavbar?: '1' | '2' | 'auto';
  firmNameSizeHero?: 'sm' | 'md' | 'lg' | 'xl';
  heroAlignment?: 'center' | 'start';
  showNavbarSubtitle?: boolean;
  navbarSubtitleAr?: string;
  navbarSubtitleEn?: string;
  navbarSubtitleTr?: string;

  // Address & Headline line & format controls
  addressLinesCount?: '1' | '2' | '3' | 'auto';
  addressDisplayMode?: 'single' | 'multiline' | 'detailed';
  heroHeadlineLines?: '1' | '2' | '3' | 'auto';
  heroSubheadlineLines?: '1' | '2' | '3' | 'auto';

  // Typography & Font Customization Suite
  fontFamilyBody?: 'tajawal' | 'cairo' | 'amiri' | 'almarai' | 'elmessiri' | 'notokufi' | 'notonaskh' | 'alexandria' | 'readex' | 'inter' | string;
  fontFamilyHeadings?: 'amiri' | 'cairo' | 'tajawal' | 'almarai' | 'elmessiri' | 'notokufi' | 'notonaskh' | 'alexandria' | 'playfair' | 'cormorant' | 'cinzel' | string;
  fontFamilyFirmName?: 'amiri' | 'cairo' | 'tajawal' | 'almarai' | 'elmessiri' | 'notokufi' | 'notonaskh' | 'alexandria' | 'cormorant' | 'cinzel' | string;
  fontFamilyHeroHeadline?: 'amiri' | 'cairo' | 'tajawal' | 'almarai' | 'elmessiri' | 'notokufi' | 'notonaskh' | 'alexandria' | 'playfair' | 'cormorant' | 'cinzel' | string;
  fontFamilyNavbar?: 'tajawal' | 'cairo' | 'amiri' | 'almarai' | 'elmessiri' | 'notokufi' | 'alexandria' | 'readex' | string;
  fontFamilyCards?: 'tajawal' | 'cairo' | 'almarai' | 'notokufi' | 'alexandria' | 'readex' | string;

  contactPhone?: string;
  contactEmail?: string;
  contactWhatsapp?: string;
  licenseNumber?: string;
  heroHeadlineAr?: string;
  heroHeadlineEn?: string;
  heroSubheadlineAr?: string;
  primaryColor?: string;

  adminPassword?: string;
}

export interface OfficeLocation {
  id: string;
  cityAr: string;
  cityEn: string;
  cityTr?: string;
  countryAr: string;
  countryEn: string;
  countryTr?: string;
  addressAr: string;
  addressEn: string;
  addressTr?: string;
  phone: string;
  email: string;
  mapEmbedUrl: string;
  isHeadquarter?: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  adminUser: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE' | 'IMPORT' | 'RESET';
  entity: string;
  entityId?: string;
  details: string;
}

export interface LawFirmData {
  settings: SiteSettings;
  partners: Partner[];
  practiceAreas: PracticeArea[];
  caseStudies: CaseStudy[];
  testimonials: Testimonial[];
  blogPosts: BlogPost[];
  offices: OfficeLocation[];
  messages: ContactMessage[];
  savedAt?: string;
}

export type SubscriptionPlanTier = 'starter' | 'professional' | 'enterprise' | 'custom';
export type SubscriptionStatus = 'active' | 'expired' | 'suspended' | 'trial';

export interface FirmSubscription {
  planTier: SubscriptionPlanTier;
  planNameAr: string;
  planNameEn: string;
  planNameTr?: string;
  status: SubscriptionStatus;
  isSiteActive: boolean; // Controls whether public landing page is active or suspended
  startDate: string; // ISO date
  endDate: string; // ISO date of annual renewal
  annualFee?: number; // Annual fee amount
  currency?: string; // 'SAR' | 'USD' | 'AED'
  autoRenew?: boolean;
  paymentStatus?: 'paid' | 'pending' | 'overdue';
  notes?: string;
}

export interface LawFirm {
  id: string;
  slug: string; // Unique URL key, e.g. "al-adl", "al-tamimi", "nahwi-law"
  nameAr: string;
  nameEn: string;
  nameTr?: string;
  taglineAr?: string;
  taglineEn?: string;
  taglineTr?: string;
  cityAr?: string;
  cityEn?: string;
  cityTr?: string;
  countryAr?: string;
  countryEn?: string;
  countryTr?: string;
  phone?: string;
  email?: string;
  logoUrl?: string;
  licenseNumber?: string;
  adminPassword: string; // Password / PIN for this specific law office manager
  isVerified?: boolean;
  featured?: boolean;
  isDefaultPublic?: boolean; // When deployed to Vercel, indicates this is the primary firm shown on the root domain
  customDomain?: string; // Optional custom domain mapping, e.g. www.nahwi-law.com
  themeColor?: string;
  status?: 'pending' | 'active' | 'suspended';
  createdAt: string;
  updatedAt: string;
  data: LawFirmData;
  subscription?: FirmSubscription;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  tableName: string; // default "law_firms"
  isConnected?: boolean;
  lastTestedAt?: string;
}

