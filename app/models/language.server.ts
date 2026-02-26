import { parseCookie, serialize } from "cookie";

import { DecoratorLocale } from "~/utils/dekoratoren.utils";

const cookieName = "decorator-language";

export async function getLanguage(request: Request): Promise<DecoratorLocale> {
  const cookieHeader = request.headers.get("Cookie") || "";

  const cookie = await parseCookie(cookieHeader);
  return cookie[cookieName] as DecoratorLocale;
}

export async function setLanguage(
  cookieHeader: string,
  language: DecoratorLocale,
): Promise<string> {
  const cookie = (await parseCookie(cookieHeader)) || {};
  cookie[cookieName] = language;

  return serialize(cookieName, language);
}
