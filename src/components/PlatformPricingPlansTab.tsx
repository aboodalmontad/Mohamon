import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Edit3, Trash2, CheckCircle2, X, Tag, Sparkles, Check, 
  Crown, Layers, ShieldCheck, DollarSign, Globe, Users, Building, 
  Cpu, HardDrive, RefreshCw, Eye, AlertTriangle, ArrowUpDown, Coins,
  Cloud
} from 'lucide-react';
import { PricingPlan, LawFirm } from '../types';
import { pricingPlanService } from '../services/pricingPlanService';

interface PlatformPricingPlansTabProps {
  firms?: LawFirm[];
  lang?: 'ar' | 'en' | 'tr';
}

export const PlatformPricingPlansTab: React.FC<PlatformPricingPlansTabProps> = ({
  firms = [],
  lang = 'ar'
}) => {
  const isAr = lang === 'ar';

  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [toastMsg, setToastMsg] = useState('');
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [lastCloudSyncTime, setLastCloudSyncTime] = useState<string | null>(null);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [deletePlanId, setDeletePlanId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    tier: string;
    nameAr: string;
    nameEn: string;
    badgeAr: string;
    badgeEn: string;
    descriptionAr: string;
    descriptionEn: string;
    priceSAR: number;
    priceUSD: number;
    priceSYP: number;
    billingCycle: 'annual' | 'monthly' | 'lifetime' | 'custom';
    isPopular: boolean;
    isActive: boolean;
    maxLawyers: number;
    maxOffices: number;
    customDomainAllowed: boolean;
    storageGB: number;
    aiAssistantEnabled: boolean;
    supportLevelAr: string;
    featuresAr: string[];
    featuresEn: string[];
    newFeatureAr: string;
    newFeatureEn: string;
  }>({
    tier: 'custom',
    nameAr: '',
    nameEn: '',
    badgeAr: '',
    badgeEn: '',
    descriptionAr: '',
    descriptionEn: '',
    priceSAR: 3000,
    priceUSD: 400,
    priceSYP: 4500000,
    billingCycle: 'annual',
    isPopular: false,
    isActive: true,
    maxLawyers: 5,
    maxOffices: 2,
    customDomainAllowed: true,
    storageGB: 20,
    aiAssistantEnabled: true,
    supportLevelAr: 'أولوية قصوى ودعم فني مخصص',
    featuresAr: [
      'موقع ويب رسمي مستقل متوافق مع كافة الشاشات',
      'لوحة تحكم لإدارة المحتوى والشركاء والتخصصات',
      'استقبال طلبات الاستشارة وحجز المواعيد إلكترونياً',
      'شهادة أمان SSL واستضافة سحابية فائقة السرعة'
    ],
    featuresEn: [
      'Responsive luxury legal website',
      'Complete content & lawyer management dashboard',
      'Direct consultation & appointment booking system',
      'SSL Security & high-speed cloud hosting'
    ],
    newFeatureAr: '',
    newFeatureEn: '',
  });

  const refreshPlans = () => {
    setPlans(pricingPlanService.getPlans(true));
  };

  useEffect(() => {
    refreshPlans();
    const handlePlansUpdated = () => refreshPlans();
    window.addEventListener('aladl_pricing_plans_updated', handlePlansUpdated);
    return () => {
      window.removeEventListener('aladl_pricing_plans_updated', handlePlansUpdated);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  // Plan Statistics
  const stats = useMemo(() => {
    const total = plans.length;
    const active = plans.filter(p => p.isActive).length;
    const popular = plans.find(p => p.isPopular);
    const avgPriceSAR = total > 0 ? Math.round(plans.reduce((acc, p) => acc + p.priceSAR, 0) / total) : 0;

    // Firm counts per plan
    const firmCountByTier: Record<string, number> = {};
    firms.forEach(f => {
      const tier = f.subscription?.planTier || 'professional';
      firmCountByTier[tier] = (firmCountByTier[tier] || 0) + 1;
    });

    return {
      total,
      active,
      popularNameAr: popular ? popular.nameAr : (isAr ? 'غير محدد' : 'None'),
      avgPriceSAR,
      firmCountByTier,
    };
  }, [plans, firms, isAr]);

  const handleOpenAdd = () => {
    setEditingPlan(null);
    setFormData({
      tier: `plan_${Date.now().toString().slice(-4)}`,
      nameAr: '',
      nameEn: '',
      badgeAr: '',
      badgeEn: '',
      descriptionAr: '',
      descriptionEn: '',
      priceSAR: 3500,
      priceUSD: 450,
      priceSYP: 5250000,
      billingCycle: 'annual',
      isPopular: false,
      isActive: true,
      maxLawyers: 5,
      maxOffices: 2,
      customDomainAllowed: true,
      storageGB: 20,
      aiAssistantEnabled: true,
      supportLevelAr: 'أولوية قصوى ودعم فني مخصص',
      featuresAr: [
        'موقع ويب رسمي مستقل متوافق مع كافة الشاشات',
        'لوحة تحكم لإدارة المحتوى والشركاء والتخصصات',
        'استقبال طلبات الاستشارة وحجز المواعيد إلكترونياً',
        'شهادة أمان SSL واستضافة سحابية فائقة السرعة'
      ],
      featuresEn: [
        'Responsive luxury legal website',
        'Complete content & lawyer management dashboard',
        'Direct consultation & appointment booking system',
        'SSL Security & high-speed cloud hosting'
      ],
      newFeatureAr: '',
      newFeatureEn: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (plan: PricingPlan) => {
    setEditingPlan(plan);
    setFormData({
      tier: plan.tier,
      nameAr: plan.nameAr,
      nameEn: plan.nameEn,
      badgeAr: plan.badgeAr || '',
      badgeEn: plan.badgeEn || '',
      descriptionAr: plan.descriptionAr,
      descriptionEn: plan.descriptionEn,
      priceSAR: plan.priceSAR,
      priceUSD: plan.priceUSD,
      priceSYP: plan.priceSYP || plan.priceSAR * 1500,
      billingCycle: plan.billingCycle,
      isPopular: !!plan.isPopular,
      isActive: plan.isActive,
      maxLawyers: plan.maxLawyers || 1,
      maxOffices: plan.maxOffices || 1,
      customDomainAllowed: plan.customDomainAllowed,
      storageGB: plan.storageGB || 10,
      aiAssistantEnabled: !!plan.aiAssistantEnabled,
      supportLevelAr: plan.supportLevelAr || 'دعم فني قياسي',
      featuresAr: [...plan.featuresAr],
      featuresEn: [...plan.featuresEn],
      newFeatureAr: '',
      newFeatureEn: '',
    });
    setIsAddModalOpen(true);
  };

  const handleManualCloudSync = async () => {
    setIsSyncingCloud(true);
    try {
      const res = await pricingPlanService.syncToCloud();
      setLastCloudSyncTime(new Date().toLocaleTimeString('ar-SA'));
      showToast(res.message);
    } catch {
      showToast(isAr ? 'فشلت المزامنة السحابية، يرجى التحقق من الاتصال' : 'Cloud sync failed, check connection');
    } finally {
      setIsSyncingCloud(false);
    }
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameAr.trim()) {
      showToast(isAr ? 'يرجى إدخال اسم الباقة بالعربية' : 'Please enter plan name');
      return;
    }

    if (editingPlan) {
      pricingPlanService.updatePlan(editingPlan.id, {
        tier: formData.tier.trim().toLowerCase(),
        nameAr: formData.nameAr.trim(),
        nameEn: formData.nameEn.trim() || formData.nameAr.trim(),
        badgeAr: formData.badgeAr.trim() || undefined,
        badgeEn: formData.badgeEn.trim() || undefined,
        descriptionAr: formData.descriptionAr.trim(),
        descriptionEn: formData.descriptionEn.trim(),
        priceSAR: Number(formData.priceSAR) || 0,
        priceUSD: Number(formData.priceUSD) || 0,
        priceSYP: Number(formData.priceSYP) || 0,
        billingCycle: formData.billingCycle,
        isPopular: formData.isPopular,
        isActive: formData.isActive,
        maxLawyers: Number(formData.maxLawyers) || 1,
        maxOffices: Number(formData.maxOffices) || 1,
        customDomainAllowed: formData.customDomainAllowed,
        storageGB: Number(formData.storageGB) || 10,
        aiAssistantEnabled: formData.aiAssistantEnabled,
        supportLevelAr: formData.supportLevelAr.trim(),
        featuresAr: formData.featuresAr,
        featuresEn: formData.featuresEn,
      });
      showToast(isAr ? '⚡️ تم تحديث الباقة وحفظها في السحابة بنجاح لكافة المستخدمين الجدد!' : 'Pricing plan updated & saved to cloud successfully for all users!');
    } else {
      pricingPlanService.addPlan({
        tier: formData.tier.trim().toLowerCase() || `custom_${Date.now().toString().slice(-4)}`,
        nameAr: formData.nameAr.trim(),
        nameEn: formData.nameEn.trim() || formData.nameAr.trim(),
        badgeAr: formData.badgeAr.trim() || undefined,
        badgeEn: formData.badgeEn.trim() || undefined,
        descriptionAr: formData.descriptionAr.trim(),
        descriptionEn: formData.descriptionEn.trim(),
        priceSAR: Number(formData.priceSAR) || 0,
        priceUSD: Number(formData.priceUSD) || 0,
        priceSYP: Number(formData.priceSYP) || 0,
        billingCycle: formData.billingCycle,
        isPopular: formData.isPopular,
        isActive: formData.isActive,
        maxLawyers: Number(formData.maxLawyers) || 1,
        maxOffices: Number(formData.maxOffices) || 1,
        customDomainAllowed: formData.customDomainAllowed,
        storageGB: Number(formData.storageGB) || 10,
        aiAssistantEnabled: formData.aiAssistantEnabled,
        supportLevelAr: formData.supportLevelAr.trim(),
        featuresAr: formData.featuresAr,
        featuresEn: formData.featuresEn,
        sortOrder: plans.length + 1,
      });
      showToast(isAr ? '⚡️ تمت إضافة الباقة وحفظها في السحابة بنجاح لكافة المستخدمين الجدد!' : 'New pricing plan created & saved to cloud successfully for all users!');
    }

    setIsAddModalOpen(false);
    refreshPlans();
  };

  const handleDeletePlan = (id: string) => {
    pricingPlanService.deletePlan(id);
    setDeletePlanId(null);
    showToast(isAr ? '⚡️ تم حذف الباقة وتحديث السحابة بنجاح!' : 'Pricing plan deleted & synced to cloud!');
    refreshPlans();
  };

  const handleToggleActive = (id: string) => {
    pricingPlanService.togglePlanActive(id);
    refreshPlans();
    showToast(isAr ? '⚡️ تم تغيير حالة التفعيل وحفظها في السحابة!' : 'Plan status updated & saved to cloud!');
  };

  const handleResetDefaults = () => {
    if (window.confirm(isAr ? 'هل أنت متأكد من استعادة باقات التسعير الافتراضية وحفظها في السحابة للمنصة؟' : 'Reset to default pricing plans and sync to cloud?')) {
      pricingPlanService.resetToDefaults();
      refreshPlans();
      showToast(isAr ? '⚡️ تمت استعادة الباقات وحفظها في السحابة بنجاح!' : 'Pricing plans reset & saved to cloud!');
    }
  };

  const handleAddFeature = () => {
    if (!formData.newFeatureAr.trim()) return;
    setFormData(prev => ({
      ...prev,
      featuresAr: [...prev.featuresAr, prev.newFeatureAr.trim()],
      featuresEn: [...prev.featuresEn, prev.newFeatureEn.trim() || prev.newFeatureAr.trim()],
      newFeatureAr: '',
      newFeatureEn: '',
    }));
  };

  const handleRemoveFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      featuresAr: prev.featuresAr.filter((_, i) => i !== index),
      featuresEn: prev.featuresEn.filter((_, i) => i !== index),
    }));
  };

  const formatPrice = (plan: PricingPlan) => {
    return `$${(plan.priceUSD || 0).toLocaleString()}`;
  };

  return (
    <div className="space-y-6 text-slate-100" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] bg-emerald-500 text-slate-950 font-black px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-emerald-400 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-slate-950" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* TOP HEADER & CONTROLS */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 border border-[#c5a869]/40 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-[#c5a869] to-amber-700 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
              <Tag className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                  {isAr ? 'إدارة خطط وباقات التسعير للمنصة' : 'Platform Pricing & Subscription Plans'}
                </h2>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                  PLANS ENGINE
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#d4af37] font-medium mt-0.5">
                {isAr 
                  ? 'تحكم كامل في باقات الاشتراك، الأسعار بالعملات المختلفة، الخصائص والمزايا المعروضة للمحامين'
                  : 'Manage subscription tiers, multi-currency rates, feature limits and benefits'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Cloud Sync Button */}
            <button
              type="button"
              disabled={isSyncingCloud}
              onClick={handleManualCloudSync}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-2 transition cursor-pointer disabled:opacity-50 shadow-md"
              title={isAr ? 'مزامنة سحابية مركزية لكافة المستخدمين الجدد' : 'Sync plans to cloud'}
            >
              <Cloud className={`w-4 h-4 text-amber-400 ${isSyncingCloud ? 'animate-bounce' : ''}`} />
              <span>{isSyncingCloud ? (isAr ? 'جاري المزامنة...' : 'Syncing...') : (isAr ? 'مزامنة سحابية الآن' : 'Sync to Cloud')}</span>
              {lastCloudSyncTime && (
                <span className="text-[10px] text-slate-400 font-mono hidden md:inline">({lastCloudSyncTime})</span>
              )}
            </button>

            {/* Reset to defaults button */}
            <button
              type="button"
              onClick={handleResetDefaults}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title={isAr ? 'استعادة الباقات الافتراضية' : 'Reset to Default Plans'}
            >
              <RefreshCw className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">{isAr ? 'استعادة الافتراضي' : 'Reset'}</span>
            </button>

            {/* Add New Plan Button */}
            <button
              type="button"
              onClick={handleOpenAdd}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-[#c5a869] to-amber-600 hover:brightness-110 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95"
            >
              <Plus className="w-4 h-4 text-slate-950 stroke-[3]" />
              <span>{isAr ? 'إضافة باقة تسعير جديدة' : 'Add New Pricing Plan'}</span>
            </button>
          </div>
        </div>

        {/* METRICS SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {/* CARD 1: TOTAL PLANS */}
          <div className="p-4.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-bold">{isAr ? 'إجمالي خطط التسعير' : 'Total Plans'}</span>
              <div className="text-2xl font-black text-white font-mono">{stats.total} {isAr ? 'باقات' : 'Plans'}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Layers className="w-5 h-5" />
            </div>
          </div>

          {/* CARD 2: ACTIVE PLANS */}
          <div className="p-4.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-bold">{isAr ? 'الباقات المفعلة بالتسجيل' : 'Active In Registration'}</span>
              <div className="text-2xl font-black text-emerald-400 font-mono">{stats.active} {isAr ? 'باقة متاحة' : 'Active'}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          {/* CARD 3: MOST POPULAR */}
          <div className="p-4.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div className="space-y-1 max-w-[150px]">
              <span className="text-xs text-slate-400 font-bold">{isAr ? 'الباقة الأكثر طلباً' : 'Featured Plan'}</span>
              <div className="text-sm font-black text-amber-300 truncate">{stats.popularNameAr}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#c5a869]/20 text-[#ebd397] flex items-center justify-center border border-[#c5a869]/40">
              <Crown className="w-5 h-5" />
            </div>
          </div>

          {/* CARD 4: AVERAGE PRICE */}
          <div className="p-4.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-bold">{isAr ? 'متوسط السعر السنوي' : 'Avg Annual Price'}</span>
              <div className="text-xl font-black text-white font-mono">{stats.avgPriceSAR.toLocaleString()} ر.س</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <Coins className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* PLANS CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const subscriberCount = stats.firmCountByTier[plan.tier] || 0;

          return (
            <div
              key={plan.id}
              className={`rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden relative shadow-xl ${
                plan.isPopular
                  ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/20 border-amber-400/60 ring-1 ring-amber-400/40'
                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
              } ${!plan.isActive ? 'opacity-60 grayscale-[30%]' : ''}`}
            >
              {/* Popular Badge */}
              {plan.isPopular && (
                <div className="absolute top-0 right-8 rtl:right-8 rtl:left-auto bg-gradient-to-r from-amber-400 via-[#c5a869] to-amber-600 text-slate-950 font-black text-[10px] px-3.5 py-1 rounded-b-xl shadow-lg flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5" />
                  <span>{isAr ? (plan.badgeAr || 'الأكثر طلباً') : (plan.badgeEn || 'Most Popular')}</span>
                </div>
              )}

              {/* Card Header */}
              <div className="p-6 space-y-4 border-b border-slate-800/80">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                        {plan.tier}
                      </span>
                      {!plan.isActive && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                          {isAr ? 'معطلة' : 'Disabled'}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-black text-white">{plan.nameAr}</h3>
                    {plan.nameEn && (
                      <div className="text-[11px] text-slate-400 font-sans">{plan.nameEn}</div>
                    )}
                  </div>

                  {/* Active Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => handleToggleActive(plan.id)}
                    className={`p-1.5 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                      plan.isActive
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                    }`}
                    title={plan.isActive ? (isAr ? 'تعطيل الباقة' : 'Disable') : (isAr ? 'تفعيل الباقة' : 'Enable')}
                  >
                    <span className={`w-2 h-2 rounded-full ${plan.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                    <span className="text-[10px]">{plan.isActive ? (isAr ? 'مفعلة' : 'Active') : (isAr ? 'معطلة' : 'Off')}</span>
                  </button>
                </div>

                {/* Price Display */}
                <div className="pt-2">
                  <div className="text-3xl font-black text-white font-mono tracking-tight flex items-baseline gap-1.5">
                    <span className="text-amber-300">{formatPrice(plan)}</span>
                    <span className="text-xs text-slate-400 font-normal">
                      / {plan.billingCycle === 'annual' ? (isAr ? 'سنوياً' : 'year') : (isAr ? 'شهرياً' : 'month')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-2">
                    {plan.descriptionAr}
                  </p>
                </div>

                {/* Plan Highlights Grid */}
                <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-slate-300">
                  <div className="flex items-center gap-1.5 bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                    <Users className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{plan.maxLawyers === -1 ? (isAr ? 'محامين غير محدود' : 'Unlimited Lawyers') : `${plan.maxLawyers} ${isAr ? 'محامين' : 'Lawyers'}`}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                    <Building className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>{plan.maxOffices === -1 ? (isAr ? 'فروع غير محدودة' : 'Unlimited Offices') : `${plan.maxOffices} ${isAr ? 'فروع' : 'Offices'}`}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                    <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{plan.customDomainAllowed ? (isAr ? 'دومين مخصص متاح' : 'Custom Domain') : (isAr ? 'نطاق فرعي فقط' : 'Subdomain')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                    <Cpu className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>{plan.aiAssistantEnabled ? (isAr ? 'ذكاء اصطناعي مفعّل' : 'AI Enabled') : (isAr ? 'بدون ذكاء اصطناعي' : 'No AI')}</span>
                  </div>
                </div>
              </div>

              {/* Features List */}
              <div className="p-6 space-y-2.5 flex-1">
                <div className="text-xs font-bold text-slate-200 flex items-center justify-between">
                  <span>{isAr ? 'المزايا والخصائص المشمولة:' : 'Included Features:'}</span>
                  <span className="text-[10px] text-slate-400">{plan.featuresAr.length} {isAr ? 'ميزة' : 'Features'}</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-300">
                  {plan.featuresAr.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span className="leading-snug">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Card Footer Actions */}
              <div className="p-5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between gap-3">
                <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>
                    {subscriberCount} {isAr ? 'مكتب مشترك حالياً' : 'Subscribers'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(plan)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                    title={isAr ? 'تعديل الباقة' : 'Edit Plan'}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isAr ? 'تعديل' : 'Edit'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeletePlanId(plan.id)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 border border-slate-700 text-xs transition cursor-pointer"
                    title={isAr ? 'حذف الباقة' : 'Delete Plan'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: ADD / EDIT PLAN */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in" dir={isAr ? 'rtl' : 'ltr'}>
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20">
                  {editingPlan ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5 stroke-[3]" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingPlan 
                      ? (isAr ? `تعديل باقة: ${editingPlan.nameAr}` : `Edit Plan: ${editingPlan.nameEn}`)
                      : (isAr ? 'إضافة باقة تسعير جديدة للمنصة' : 'Create New Pricing Plan')}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isAr ? 'حدد الاسم، الأسعار بالعملات، والخصائص المشمولة' : 'Configure name, multi-currency rates & features'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSavePlan} className="space-y-4 text-xs">
              {/* Names & Tier */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-bold mb-1">
                    {isAr ? 'اسم الباقة (بالعربية) *:' : 'Plan Name (Arabic) *:'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nameAr}
                    onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                    placeholder={isAr ? 'مثال: باقة النخبة الماسية' : 'e.g. Diamond Enterprise'}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {isAr ? 'رمز الفئة (Tier ID) *:' : 'Tier ID Code *:'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.tier}
                    onChange={(e) => setFormData({ ...formData, tier: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '_') })}
                    placeholder="enterprise_plus"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-amber-300 font-mono focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Name EN & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {isAr ? 'اسم الباقة بالإنجليزية:' : 'Plan Name (English):'}
                  </label>
                  <input
                    type="text"
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    placeholder="e.g. Diamond Elite Plan"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-sans focus:border-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {isAr ? 'الشارة التسويقية (Badge):' : 'Marketing Badge:'}
                  </label>
                  <input
                    type="text"
                    value={formData.badgeAr}
                    onChange={(e) => setFormData({ ...formData, badgeAr: e.target.value })}
                    placeholder={isAr ? 'مثال: الأكثر طلباً / خصم 30%' : 'e.g. Most Popular / 20% Off'}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {isAr ? 'وصف موجز للباقة:' : 'Plan Brief Description:'}
                </label>
                <textarea
                  rows={2}
                  value={formData.descriptionAr}
                  onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                  placeholder={isAr ? 'اكتب وصفاً جذاباً يوضح الفئة المستهدفة من هذه الباقة...' : 'Brief description...'}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              {/* Pricing in USD */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-amber-400 text-xs flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4" />
                  <span>{isAr ? 'سعر الاشتراك ودورة الفوترة بالدولار ($ USD)' : 'Subscription Price & Billing Cycle'}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">{isAr ? 'السعر ($ USD) *:' : 'Price ($ USD) *:'}</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formData.priceUSD}
                      onChange={(e) => setFormData({ ...formData, priceUSD: Number(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono font-bold focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">{isAr ? 'دورة الفوترة:' : 'Billing Cycle:'}</label>
                    <select
                      value={formData.billingCycle}
                      onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none cursor-pointer"
                    >
                      <option value="annual">{isAr ? 'سنوي (Annual)' : 'Annual'}</option>
                      <option value="monthly">{isAr ? 'شهري (Monthly)' : 'Monthly'}</option>
                      <option value="lifetime">{isAr ? 'مدى الحياة (Lifetime)' : 'Lifetime'}</option>
                      <option value="custom">{isAr ? 'مخصص (Custom)' : 'Custom'}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Technical limits & Features */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-blue-400 text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isAr ? 'الحدود التقنية والمزايا الحصرية' : 'Technical Limits & Features'}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">{isAr ? 'الحد الأقصى للمحامين:' : 'Max Lawyers:'}</label>
                    <input
                      type="number"
                      value={formData.maxLawyers}
                      onChange={(e) => setFormData({ ...formData, maxLawyers: Number(e.target.value) || 1 })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">{isAr ? 'الحد الأقصى للفروع:' : 'Max Offices:'}</label>
                    <input
                      type="number"
                      value={formData.maxOffices}
                      onChange={(e) => setFormData({ ...formData, maxOffices: Number(e.target.value) || 1 })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">{isAr ? 'مساحة التخزين (GB):' : 'Storage (GB):'}</label>
                    <input
                      type="number"
                      value={formData.storageGB}
                      onChange={(e) => setFormData({ ...formData, storageGB: Number(e.target.value) || 10 })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.customDomainAllowed}
                      onChange={(e) => setFormData({ ...formData, customDomainAllowed: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700 cursor-pointer"
                    />
                    <span className="text-slate-300">{isAr ? 'إتاحة ربط دومين مخصص مستقل' : 'Custom Domain Support'}</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.aiAssistantEnabled}
                      onChange={(e) => setFormData({ ...formData, aiAssistantEnabled: e.target.checked })}
                      className="w-4 h-4 rounded text-purple-500 bg-slate-900 border-slate-700 cursor-pointer"
                    />
                    <span className="text-slate-300">{isAr ? 'تفعيل مساعد الذكاء الاصطناعي' : 'AI Assistant Enabled'}</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPopular}
                      onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700 cursor-pointer"
                    />
                    <span className="text-amber-300 font-bold">{isAr ? 'تمييز كـ "الأكثر طلباً" (Featured)' : 'Featured Most Popular'}</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 cursor-pointer"
                    />
                    <span className="text-emerald-300 font-bold">{isAr ? 'باقة نشطة ومتاحة للتسجيل' : 'Active & Available'}</span>
                  </label>
                </div>
              </div>

              {/* Dynamic Features List Builder */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-emerald-400 text-xs flex items-center justify-between">
                  <span>{isAr ? 'قائمة المزايا والخصائص النقطية' : 'Features Checklist Builder'}</span>
                  <span className="text-[10px] text-slate-400">{formData.featuresAr.length} {isAr ? 'ميزة مدخلة' : 'Items'}</span>
                </h4>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {formData.featuresAr.map((feat, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="text-white text-xs">{feat}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded-lg transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Feature input */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    value={formData.newFeatureAr}
                    onChange={(e) => setFormData({ ...formData, newFeatureAr: e.target.value })}
                    placeholder={isAr ? 'اكتب ميزة جديدة لإضافتها للباقة...' : 'Add a new feature...'}
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:border-amber-400 focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFeature();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl transition cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>{isAr ? 'إضافة' : 'Add'}</span>
                  </button>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 hover:brightness-110 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer active:scale-95"
                >
                  <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
                  <span>{editingPlan ? (isAr ? 'حفظ التعديلات' : 'Save Changes') : (isAr ? 'إنشاء وتدشين الباقة' : 'Create Plan')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {deletePlanId && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in" dir={isAr ? 'rtl' : 'ltr'}>
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">
                {isAr ? 'تأكيد حذف باقة التسعير' : 'Confirm Delete Plan'}
              </h3>
              <p className="text-xs text-slate-400">
                {isAr ? 'هل أنت متأكد من رغبتك في حذف هذه الباقة من المنصة نهائياً؟' : 'Are you sure you want to permanently delete this plan?'}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletePlanId(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition cursor-pointer text-xs"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>

              <button
                type="button"
                onClick={() => handleDeletePlan(deletePlanId)}
                className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black transition cursor-pointer text-xs shadow-lg shadow-rose-500/30"
              >
                {isAr ? 'نعم، احذف الباقة' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
