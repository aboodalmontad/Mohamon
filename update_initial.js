const fs = import('fs');
let content = fs.readFileSync('src/data/initialData.ts', 'utf8');

content = content.replace(
  "import { Partner, PracticeArea, Testimonial, BlogPost, CaseStudy, SiteSettings, OfficeLocation, ContactMessage } from '../types';",
  "import { Partner, PracticeArea, Testimonial, BlogPost, CaseStudy, PlatformSettings, SiteSettings, OfficeLocation, ContactMessage } from '../types';"
);

const newConst = `
export const initialPlatformSettings: PlatformSettings = {
  platformNameAr: 'محامون',
  platformNameEn: 'Lawyers Platform',
  heroBadgeAr: 'المنصة السحابية الأولى لإدارة مكاتب المحاماة',
  heroBadgeEn: 'The Leading Cloud Platform for Law Firms',
  heroHeadingAr: 'أنشئ مكتبك الرقمي خلال دقائق',
  heroHeadingEn: 'Create Your Digital Firm in Minutes',
  heroSubheadingAr: 'منصة "محامون" تتيح لك إطلاق موقع احترافي لمكتبك، استقبال الاستشارات، وإدارة العملاء بكل سهولة وسرية تامة.',
  heroSubheadingEn: 'Lawyers Platform allows you to launch a professional website, receive consultations, and manage clients with absolute ease and confidentiality.',
  heroBannerUrl: '',
  ctaPrimaryAr: 'افتح مكتبك الآن',
  ctaPrimaryEn: 'Start Your Firm',
  ctaSecondaryAr: 'تصفح المكاتب',
  ctaSecondaryEn: 'Browse Firms',
};

export const initialSiteSettings: SiteSettings = {`;

content = content.replace("export const initialSiteSettings: SiteSettings = {", newConst);

fs.writeFileSync('src/data/initialData.ts', content);
