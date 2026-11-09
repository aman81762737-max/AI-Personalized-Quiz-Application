/**
 * Safe LocalStorage Utility
 * Guards against QuotaExceededError and private-browsing storage exceptions.
 */

export const safeSetItem = (key: string, value: string): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err: any) {
    console.warn(`[SafeStorage] Quota or storage write error on "${key}":`, err?.message || err);

    // If quota exceeded, clean up oversized/stale keys and retry once
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (
          k &&
          (k.startsWith('academic_materials_') ||
            k.startsWith('eval_temp_') ||
            k.startsWith('ai_quick_notes_history') ||
            k.startsWith('ai_theme_history') ||
            k.includes('avatar_blob'))
        ) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => {
        try {
          localStorage.removeItem(k);
        } catch {}
      });

      // Try setting again after clearing heavy items
      localStorage.setItem(key, value);
      return true;
    } catch {
      console.warn(`[SafeStorage] Secondary attempt failed for "${key}". Value not persisted locally.`);
      return false;
    }
  }
};

export const safeGetItem = (key: string, defaultValue: string = ''): string => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    return localStorage.getItem(key) ?? defaultValue;
  } catch {
    return defaultValue;
  }
};

export const safeRemoveItem = (key: string): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch {}
};
