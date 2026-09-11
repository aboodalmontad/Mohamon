/**
 * Service to sync and deploy site data directly to GitHub & Vercel
 */
import { storageService } from './storageService';

export interface VercelSyncConfig {
  githubRepo: string; // e.g. "username/repo-name"
  githubToken: string; // GitHub personal access token (with repo scope)
  branch: string; // default "main"
  deployHookUrl?: string; // Optional Vercel Deploy Hook URL
}

const STORAGE_KEY = 'aladl_vercel_sync_config';

function utf8ToBase64(str: string): string {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => {
    return String.fromCharCode(parseInt(p1, 16));
  }));
}

export const vercelSyncService = {
  getConfig: (): VercelSyncConfig => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return {
      githubRepo: '',
      githubToken: '',
      branch: 'main',
      deployHookUrl: '',
    };
  },

  saveConfig: (config: VercelSyncConfig) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  },

  // Commit a single file to GitHub repo
  commitFileToGitHub: async (
    repo: string,
    path: string,
    content: string,
    message: string,
    token: string,
    branch = 'main'
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const cleanRepo = repo.replace(/^https:\/\/github\.com\//, '').replace(/^\/+|\/+$/g, '');
      const url = `https://api.github.com/repos/${cleanRepo}/contents/${path}?ref=${branch}`;

      // 1. Get existing file SHA if it exists
      let sha: string | undefined;
      const getRes = await fetch(url, {
        headers: {
          Authorization: `token ${token.trim()}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (getRes.ok) {
        const fileData = await getRes.json();
        sha = fileData.sha;
      }

      // 2. Put file
      const putRes = await fetch(`https://api.github.com/repos/${cleanRepo}/contents/${path}`, {
        method: 'PUT',
        headers: {
          Authorization: `token ${token.trim()}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          content: utf8ToBase64(content),
          branch,
          ...(sha ? { sha } : {}),
        }),
      });

      if (!putRes.ok) {
        const errJson = await putRes.json().catch(() => ({}));
        return {
          success: false,
          error: errJson.message || `HTTP ${putRes.status}: Failed to commit ${path}`,
        };
      }

      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message || 'Network error' };
    }
  },

  // Deploy all data (src/data/initialData.ts and public/site_data.json) to GitHub/Vercel
  deployDataToGitHub: async (
    onProgress?: (step: string) => void
  ): Promise<{ success: boolean; message: string }> => {
    const config = vercelSyncService.getConfig();
    if (!config.githubRepo || !config.githubToken) {
      return {
        success: false,
        message: 'يرجى إدخال اسم المستودع (GitHub Repository) ورمز الوصول (Personal Access Token) أولاً.',
      };
    }

    const branch = config.branch || 'main';
    const cleanRepo = config.githubRepo.replace(/^https:\/\/github\.com\//, '').replace(/^\/+|\/+$/g, '');

    try {
      onProgress?.('جاري توليد ملفات البيانات المحدثة (initialData.ts)...');
      const tsCode = storageService.generateInitialDataTS();
      const jsonCode = storageService.exportDataJSON();

      onProgress?.(`جاري رفع وتحديث ملف src/data/initialData.ts على فرع ${branch}...`);
      const tsCommit = await vercelSyncService.commitFileToGitHub(
        cleanRepo,
        'src/data/initialData.ts',
        tsCode,
        'chore: update site data from admin dashboard [deploy to vercel]',
        config.githubToken,
        branch
      );

      if (!tsCommit.success) {
        return {
          success: false,
          message: `فشل تحديث ملف initialData.ts: ${tsCommit.error}`,
        };
      }

      onProgress?.(`جاري رفع وتحديث ملف public/site_data.json على فرع ${branch}...`);
      const jsonCommit = await vercelSyncService.commitFileToGitHub(
        cleanRepo,
        'public/site_data.json',
        jsonCode,
        'chore: update public site_data.json snapshot',
        config.githubToken,
        branch
      );

      if (!jsonCommit.success) {
        return {
          success: false,
          message: `فشل تحديث ملف site_data.json: ${jsonCommit.error}`,
        };
      }

      // If deploy hook provided, trigger it
      if (config.deployHookUrl && config.deployHookUrl.startsWith('http')) {
        onProgress?.('جاري إرسال إشعار إعادة البناء إلى Vercel Deploy Hook...');
        try {
          await fetch(config.deployHookUrl, { method: 'POST' });
        } catch {
          // ignore hook error if GitHub commit succeeded
        }
      }

      onProgress?.('تم رفع البيانات بنجاح! يقوم Vercel الآن ببناء وتحديث الموقع live لجميع الزوار...');
      return {
        success: true,
        message: 'تم رفع ونشر البيانات إلى مستودع GitHub بنجاح! سيتم تحديث موقع Vercel خلال ثوانٍ معدودة وسيظهر لجميع الزوار تلقائياً.',
      };
    } catch (err: unknown) {
      return {
        success: false,
        message: (err as Error).message || 'حدث خطأ أثناء الاتصال',
      };
    }
  },

  // Trigger Vercel Deploy Hook only
  triggerDeployHook: async (): Promise<{ success: boolean; message: string }> => {
    const config = vercelSyncService.getConfig();
    if (!config.deployHookUrl) {
      return {
        success: false,
        message: 'يرجى إدخال رابط Vercel Deploy Hook في الإعدادات أولاً.',
      };
    }

    try {
      const res = await fetch(config.deployHookUrl, { method: 'POST' });
      if (res.ok) {
        return {
          success: true,
          message: 'تم إطلاق أمر إعادة البناء على Vercel بنجاح!',
        };
      }
      return {
        success: false,
        message: `تعذر تشغيل الخطاف: HTTP ${res.status}`,
      };
    } catch (err: unknown) {
      return {
        success: false,
        message: (err as Error).message || 'حدث خطأ في الاتصال بالخطاف',
      };
    }
  },
};
