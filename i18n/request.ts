import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const headersList = await headers();
  
  // Try to get locale from cookie first, then from header, then default to 'en'
  let locale = cookieStore.get('locale')?.value || 
               headersList.get('x-locale') || 
               'en';

  // Ensure locale is valid
  const validLocales = ['en', 'sv'];
  if (!validLocales.includes(locale)) {
    locale = 'en';
  }

  try {
    return {
      locale,
      messages: (await import(`../messages/${locale}.json`)).default
    };
  } catch (error) {
    // Fallback to English if locale file doesn't exist
    return {
      locale: 'en',
      messages: (await import(`../messages/en.json`)).default
    };
  }
});