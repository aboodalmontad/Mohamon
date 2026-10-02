import { PricingPlan } from '../types';

const STORAGE_KEY_PLANS = 'aladl_platform_pricing_plans_v1';

export const initialPricingPlans: PricingPlan[] = [
  {
    id: 'plan-starter',
    tier: 'starter',
    nameAr: 'الباقة القياسية (Starter)',
    nameEn: 'Standard Starter Plan',
    nameTr: 'Standart Başlangıç Paketi',
    badgeAr: 'للمحامي المستقل والمكاتب الفردية',
    badgeEn: 'For Solo Lawyers & Boutique Practices',
    badgeTr: 'Bireysel Avukatlar İçin',
    descriptionAr: 'حل متكامل لإطلاق موقع قانوني رسمي بمظهر مهني وتلقي الاستشارات أونلاين.',
    descriptionEn: 'Essential foundation for establishing a prestigious online legal presence.',
    descriptionTr: 'Prestijli bir çevrimiçi varlık için temel hukuk bürosu paketi.',
    priceUSD: 250,
    billingCycle: 'annual',
    isPopular: false,
    isActive: true,
    maxLawyers: 1,
    maxOffices: 1,
    customDomainAllowed: false,
    storageGB: 5,
    aiAssistantEnabled: false,
    supportLevelAr: 'دعم فني عبر البريد وتذاكر المساعدة',
    sortOrder: 1,
    featuresAr: [
      'موقع ويب رسمي فخم متوافق مع كافة الشاشات والموبايل',
      'لوحة تحكم خاصة لإدارة المحتوى والخدمات القانونية',
      'استقبال طلبات الاستشارة والرسائل مع إشعارات بريدية',
      'شهادة أمان SSL واستضافة سحابية فائقة السرعة',
      'دعم لغتين (عربي / إنجليزي)',
      'تحديثات دورية وحماية مشفرة'
    ],
    featuresEn: [
      'Responsive luxury legal website for all devices',
      'Dedicated management dashboard for firm content',
      'Direct client consultation request intake',
      'SSL Security & ultra-fast cloud hosting',
      'Bilingual support (Arabic / English)',
      'Regular updates and secure backups'
    ],
    featuresTr: [
      'Tüm cihazlarla uyumlu lüks hukuk web sitesi',
      'İçerik yönetimi için özel kontrol paneli',
      'Doğrudan danışmanlık talepleri alma',
      'SSL Güvenlik ve hızlı bulut barındırma',
      'Çift dil desteği'
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'plan-professional',
    tier: 'professional',
    nameAr: 'الباقة الاحترافية (Professional)',
    nameEn: 'Executive Professional Plan',
    nameTr: 'Profesyonel Yönetici Paketi',
    badgeAr: 'الأكثر طلباً - لفرق العمل والمكاتب المتطورة',
    badgeEn: 'Most Popular - For Growing Legal Teams',
    badgeTr: 'En Popüler - Büyüyen Ekipler İçin',
    descriptionAr: 'الباقة المثالية للمكاتب الساعية للريادة مع ربط النطاق المخصص وميزات الذكاء القانوني.',
    descriptionEn: 'The ideal solution for ambitious law firms requiring custom domains & team management.',
    descriptionTr: 'Özel alan adı ve ekip yönetimi gerektiren hukuk büroları için ideal çözüm.',
    priceUSD: 450,
    billingCycle: 'annual',
    isPopular: true,
    isActive: true,
    maxLawyers: 10,
    maxOffices: 3,
    customDomainAllowed: true,
    storageGB: 25,
    aiAssistantEnabled: true,
    supportLevelAr: 'أولوية قصوى ودعم فني مخصص عبر واتساب والبريد',
    sortOrder: 2,
    featuresAr: [
      'كافة مميزات الباقة القياسية',
      'إدارة غير محدودة للمحامين والشركاء والتخصصات والقضايا',
      'ربط نطاق مخصص مستقل باسم مكتبك (مثال: nahwi.law / nahwi.com)',
      'نظام حجز مواعيد واستشارات ذكي مع إشعارات واتساب فورية',
      'محرك ترجمة فورية متعدد اللغات (عربي / إنجليزي / تركي)',
      'مساعد قانوني بالذكاء الاصطناعي لصياغة النماذج وتلخيص القضايا',
      'أولوية قصوى في الدعم الفني والاستجابة'
    ],
    featuresEn: [
      'All features in Standard Starter Plan',
      'Unlimited lawyer profiles, practice areas & case studies',
      'Custom standalone domain support (e.g. nahwi.law)',
      'Smart appointment & consultation booking with WhatsApp alerts',
      'Multi-language instant translation (AR / EN / TR)',
      'AI-powered legal drafting & consultation assistant',
      'High-priority technical support'
    ],
    featuresTr: [
      'Başlangıç paketindeki tüm özellikler',
      'Sınırsız avukat profili ve uzmanlık alanı yönetimi',
      'Özel alan adı desteği (örn: nahwi.law)',
      'Akıllı randevu ve danışmanlık sistemi',
      'Yapay zeka hukuki asistan desteği',
      'Yüksek öncelikli teknik destek'
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'plan-enterprise',
    tier: 'enterprise',
    nameAr: 'الباقة الماسية والمؤسسات (Enterprise)',
    nameEn: 'Diamond Enterprise Plan',
    nameTr: 'Kurumsal Elmas Paket',
    badgeAr: 'لشركات المحاماة والمؤسسات القانونية الكبرى',
    badgeEn: 'For Leading Law Firms & Multibranch Groups',
    badgeTr: 'Büyük Hukuk Büroları ve Şirketler İçin',
    descriptionAr: 'قوة تقنية متكاملة ومقرات متعددة مع تخصيص هوية كامل ودعم استشاري على مدار الساعة.',
    descriptionEn: 'Comprehensive corporate solution with multi-branch management & VIP 24/7 dedicated support.',
    descriptionTr: 'Çok şubeli yönetim ve 7/24 VIP destek ile kapsamlı kurumsal çözüm.',
    priceUSD: 850,
    billingCycle: 'annual',
    isPopular: false,
    isActive: true,
    maxLawyers: 50,
    maxOffices: 10,
    customDomainAllowed: true,
    storageGB: 100,
    aiAssistantEnabled: true,
    supportLevelAr: 'مدير حساب خاص مخصص + خط ساخن 24/7',
    sortOrder: 3,
    featuresAr: [
      'كافة مميزات الباقة الاحترافية الشاملة',
      'دعم فروع ومقرات متعددة للمكتب محلياً ودولياً',
      'تخصيص كامل للألوان والخطوط والأيقونات والهوية البصرية',
      'سجل تدقيق أمني متقدم ومزامنة فورية مع قواعد البيانات المركزية',
      'نسخ احتياطي فوري متكرر وأعلى معايير تشفير البيانات',
      'مدير حساب خاص مكرس للمكتب ودعم استشاري وتقني 24/7',
      'إمكانية الربط مع الأنظمة الإدارية والقضائية الداخلية'
    ],
    featuresEn: [
      'All features in Executive Professional Plan',
      'Multi-branch and international office directory support',
      'Complete branding, font, and visual identity customization',
      'Advanced security audit logs & real-time DB sync',
      'Automated high-frequency backups & bank-grade encryption',
      'Dedicated Account Manager & 24/7 VIP helpline',
      'API & CRM integration capabilities'
    ],
    featuresTr: [
      'Profesyonel paketteki tüm özellikler',
      'Çok şubeli ve uluslararası ofis yönetimi',
      'Tam kurumsal kimlik ve tasarım özelleştirmesi',
      'Gelişmiş güvenlik günlükleri ve anlık yedekleme',
      'Özel Müşteri Yöneticisi ve 7/24 VIP destek'
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

class PricingPlanService {
  private plans: PricingPlan[] = [];

  constructor() {
    this.loadPlans();
  }

  private loadPlans() {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY_PLANS);
      if (stored) {
        this.plans = JSON.parse(stored);
      } else {
        this.plans = initialPricingPlans;
        this.savePlans();
      }
    } catch (e) {
      console.error('Error loading pricing plans:', e);
      this.plans = initialPricingPlans;
    }
  }

  private savePlans() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_PLANS, JSON.stringify(this.plans));
      window.dispatchEvent(new CustomEvent('aladl_pricing_plans_updated'));
    }
  }

  public getPlans(includeInactive: boolean = false): PricingPlan[] {
    const list = includeInactive ? this.plans : this.plans.filter(p => p.isActive);
    return [...list].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  public getPlanById(id: string): PricingPlan | undefined {
    return this.plans.find(p => p.id === id);
  }

  public getPlanByTier(tier: string): PricingPlan | undefined {
    return this.plans.find(p => p.tier === tier);
  }

  public addPlan(plan: Omit<PricingPlan, 'id' | 'createdAt' | 'updatedAt'>): PricingPlan {
    const newId = `plan-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newPlan: PricingPlan = {
      ...plan,
      id: newId,
      sortOrder: plan.sortOrder || this.plans.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // If marked popular, unmark others if necessary
    if (newPlan.isPopular) {
      this.plans.forEach(p => { p.isPopular = false; });
    }

    this.plans.push(newPlan);
    this.savePlans();
    return newPlan;
  }

  public updatePlan(id: string, updates: Partial<PricingPlan>): boolean {
    const idx = this.plans.findIndex(p => p.id === id);
    if (idx !== -1) {
      // If setting this plan as popular, clear others
      if (updates.isPopular) {
        this.plans.forEach(p => {
          if (p.id !== id) p.isPopular = false;
        });
      }

      this.plans[idx] = {
        ...this.plans[idx],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.savePlans();
      return true;
    }
    return false;
  }

  public deletePlan(id: string): boolean {
    const prevLen = this.plans.length;
    this.plans = this.plans.filter(p => p.id !== id);
    if (this.plans.length !== prevLen) {
      this.savePlans();
      return true;
    }
    return false;
  }

  public togglePlanActive(id: string): boolean {
    const plan = this.plans.find(p => p.id === id);
    if (plan) {
      plan.isActive = !plan.isActive;
      plan.updatedAt = new Date().toISOString();
      this.savePlans();
      return true;
    }
    return false;
  }

  public reorderPlans(orderedIds: string[]): boolean {
    orderedIds.forEach((id, index) => {
      const plan = this.plans.find(p => p.id === id);
      if (plan) {
        plan.sortOrder = index + 1;
      }
    });
    this.savePlans();
    return true;
  }

  public resetToDefaults(): PricingPlan[] {
    this.plans = initialPricingPlans;
    this.savePlans();
    return this.getPlans(true);
  }
}

export const pricingPlanService = new PricingPlanService();
