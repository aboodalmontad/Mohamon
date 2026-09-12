import React, { useState, useRef } from 'react';
import { Save, Image as ImageIcon, Layout, CheckCircle2, Upload, Trash2 } from 'lucide-react';
import { PlatformSettings, Language } from '../types';
import { storageService } from '../services/storageService';

interface PlatformSettingsTabProps {
  lang: Language;
}

export const PlatformSettingsTab: React.FC<PlatformSettingsTabProps> = ({ lang }) => {
  const isAr = lang === 'ar';
  const [settings, setSettings] = useState<PlatformSettings>(storageService.getPlatformSettings());
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert(isAr ? 'حجم الصورة كبير جداً (الحد الأقصى 5 ميجابايت)' : 'File size is too large (Max 5MB)');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setSettings(prev => ({ ...prev, heroBannerUrl: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSettings(prev => ({ ...prev, heroBannerUrl: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = () => {
    setSaveStatus('saving');
    storageService.savePlatformSettings(settings);
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-4xl pb-10" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white font-serif-title flex items-center gap-2">
            <Layout className="w-5 h-5 text-[#c5a869]" />
            {isAr ? 'تصميم وإعدادات واجهة المنصة' : 'Platform Landing Page Settings'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isAr ? 'قم بتخصيص النصوص والصور والأزرار المعروضة في الصفحة الرئيسية للمنصة' : 'Customize text, images, and buttons displayed on the platform landing page'}
          </p>
        </div>
        
        <button
          onClick={handleSave}
          disabled={saveStatus === 'saving'}
          className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#c5a869] to-[#ebd397] hover:brightness-110 text-slate-950 text-sm font-bold flex items-center gap-2 transition cursor-pointer shadow-lg shadow-[#c5a869]/20 disabled:opacity-70"
        >
          {saveStatus === 'saved' ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>{isAr ? 'تم الحفظ' : 'Saved'}</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{isAr ? 'حفظ التغييرات' : 'Save Changes'}</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Arabic Settings */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <span className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">AR</span>
            <h3 className="font-bold text-white text-sm">المحتوى العربي</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">اسم المنصة</label>
              <input type="text" name="platformNameAr" value={settings.platformNameAr} onChange={handleChange} className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:border-[#c5a869] focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">الشارة العلوية (Badge)</label>
              <input type="text" name="heroBadgeAr" value={settings.heroBadgeAr} onChange={handleChange} className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:border-[#c5a869] focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">العنوان الرئيسي (يدعم كود HTML)</label>
              <textarea name="heroHeadingAr" value={settings.heroHeadingAr} onChange={handleChange} rows={3} className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white font-mono focus:border-[#c5a869] focus:outline-none" dir="ltr" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">النص الفرعي (الوصف)</label>
              <textarea name="heroSubheadingAr" value={settings.heroSubheadingAr} onChange={handleChange} rows={3} className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:border-[#c5a869] focus:outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">زر الإجراء الأساسي</label>
                <input type="text" name="ctaPrimaryAr" value={settings.ctaPrimaryAr} onChange={handleChange} className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:border-[#c5a869] focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">زر الإجراء الثانوي</label>
                <input type="text" name="ctaSecondaryAr" value={settings.ctaSecondaryAr} onChange={handleChange} className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:border-[#c5a869] focus:outline-none" />
              </div>
            </div>
          </div>
        </div>

        {/* English Settings */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <span className="w-6 h-6 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">EN</span>
            <h3 className="font-bold text-white text-sm">English Content</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Platform Name</label>
              <input type="text" name="platformNameEn" value={settings.platformNameEn} onChange={handleChange} className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:border-[#c5a869] focus:outline-none" dir="ltr" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Top Badge</label>
              <input type="text" name="heroBadgeEn" value={settings.heroBadgeEn} onChange={handleChange} className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:border-[#c5a869] focus:outline-none" dir="ltr" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Main Heading (supports HTML)</label>
              <textarea name="heroHeadingEn" value={settings.heroHeadingEn} onChange={handleChange} rows={3} className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white font-mono focus:border-[#c5a869] focus:outline-none" dir="ltr" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Subheading (Description)</label>
              <textarea name="heroSubheadingEn" value={settings.heroSubheadingEn} onChange={handleChange} rows={3} className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:border-[#c5a869] focus:outline-none" dir="ltr" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Primary CTA Button</label>
                <input type="text" name="ctaPrimaryEn" value={settings.ctaPrimaryEn} onChange={handleChange} className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:border-[#c5a869] focus:outline-none" dir="ltr" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Secondary CTA Button</label>
                <input type="text" name="ctaSecondaryEn" value={settings.ctaSecondaryEn} onChange={handleChange} className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:border-[#c5a869] focus:outline-none" dir="ltr" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Settings */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <ImageIcon className="w-5 h-5 text-purple-400" />
          <h3 className="font-bold text-white text-sm">{isAr ? 'صورة البانر الخلفية' : 'Hero Banner Image'}</h3>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-2">
            {isAr ? 'رفع صورة البانر من الجهاز أو إدخال رابط مباشر' : 'Upload banner image from device or enter direct URL'}
          </label>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              id="hero-banner-file-input"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>{isAr ? 'اختيار صورة من الجهاز' : 'Upload from Device'}</span>
            </button>

            <span className="text-xs text-slate-500 text-center sm:text-start">{isAr ? 'أو' : 'or'}</span>

            <input 
              type="text" 
              name="heroBannerUrl" 
              value={settings.heroBannerUrl || ''} 
              onChange={handleChange} 
              placeholder="https://..."
              className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:border-[#c5a869] focus:outline-none" 
              dir="ltr"
            />

            {settings.heroBannerUrl && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="px-3 py-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer"
                title={isAr ? 'إزالة الصورة' : 'Remove Image'}
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">{isAr ? 'إزالة' : 'Remove'}</span>
              </button>
            )}
          </div>
          <p className="text-[10px] text-slate-500 mt-2">
            {isAr ? 'يدعم الصور حتى 5 ميجابايت (JPG, PNG, WebP). اترك الحقل فارغاً لاستخدام التأثيرات الضوئية الافتراضية.' : 'Supports images up to 5MB (JPG, PNG, WebP). Leave empty for default glow background.'}
          </p>
        </div>
        
        {settings.heroBannerUrl && (
          <div className="mt-3 relative h-48 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 group">
            <img src={settings.heroBannerUrl} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end justify-between p-3">
              <span className="text-white text-xs font-bold px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                {isAr ? 'معاينة البانر في واجهة المنصة' : 'Banner Preview'}
              </span>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="px-2.5 py-1 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-medium flex items-center gap-1 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isAr ? 'حذف الصورة' : 'Delete'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
