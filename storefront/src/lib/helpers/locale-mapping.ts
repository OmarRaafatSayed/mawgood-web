// Map locale (language) to country code
export const localeToCountry: Record<string, string> = {
  ar: 'eg', // Arabic -> Egypt
  en: 'eg', // English -> Egypt (default for now)
};

export const getCountryFromLocale = (locale: string): string => {
  return localeToCountry[locale] || 'eg';
};
