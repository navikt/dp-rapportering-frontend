import { createCookie } from "@remix-run/node";

const cookieName = "dp-rapportering-informasjon-nytt-meldekort";
const infoAlertCookie = createCookie(cookieName);

export async function getInfoAlertStatus(request: Request): Promise<boolean> {
  const cookieHeader = request.headers.get("Cookie");

  const cookie = (await infoAlertCookie.parse(cookieHeader)) || {};
  return cookie[cookieName];
}

export async function setInfoAlertStatus(cookieHeader: string, show: boolean): Promise<string> {
  const cookie = (await infoAlertCookie.parse(cookieHeader)) || {};

  cookie[cookieName] = show;
  return infoAlertCookie.serialize(cookie);
}
