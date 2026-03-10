import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";

export const locales = ["en", "zh"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export default getRequestConfig(async () => {
  // Try to get locale from cookie first
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("NEXT_LOCALE")?.value;
  
  if (localeCookie && locales.includes(localeCookie as Locale)) {
    return {
      locale: localeCookie,
      messages: (await import(`../messages/${localeCookie}.json`)).default,
    };
  }

  // Then try to detect from Accept-Language header
  const headersList = await headers();
  const acceptLanguage = headersList.get("accept-language") || "";
  
  // Parse Accept-Language header
  const browserLocale = acceptLanguage
    .split(",")
    .map((lang) => lang.split(";")[0].trim().substring(0, 2).toLowerCase())
    .find((lang) => locales.includes(lang as Locale));

  const locale = browserLocale || defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
