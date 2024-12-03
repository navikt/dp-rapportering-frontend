import { DecoratorLocale } from "@navikt/nav-dekoratoren-moduler";
import { createCookie } from "@remix-run/node";

const cookieName = "dp-rapportering-frontend-decorator-language";
const languageCookie = createCookie(cookieName);

export async function getLanguage(request: Request): Promise<DecoratorLocale> {
  const cookieHeader = request.headers.get("Cookie");

  const cookie = (await languageCookie.parse(cookieHeader)) || {};
  return cookie[cookieName];
}

export async function setLanguage(
  cookieHeader: string,
  language: DecoratorLocale,
): Promise<string> {
  const cookie = (await languageCookie.parse(cookieHeader)) || {};

  cookie[cookieName] = language;
  return languageCookie.serialize(cookie);
}
