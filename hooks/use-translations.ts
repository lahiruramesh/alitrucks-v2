"use client";

import { useTranslations as useNextIntlTranslations } from 'next-intl';

export function useTranslations(namespace?: string) {
  const t = useNextIntlTranslations(namespace);
  
  // Return a function that provides fallbacks for missing translations
  return (key: string, fallback?: string) => {
    try {
      const translation = t(key);
      // If translation is the same as the key, it might be missing
      if (translation === key && fallback) {
        return fallback;
      }
      return translation;
    } catch (error) {
      // Return fallback or key if translation fails
      return fallback || key;
    }
  };
}