import { app, ensurePublicDataFile } from '../src/server-app';

try {
  ensurePublicDataFile();
} catch (e) {
  console.warn('ensurePublicDataFile skipped during serverless cold start:', e);
}

export default app;
