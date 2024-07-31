import { createCookie } from "@remix-run/node";

export const rapporteringstypeCookie = createCookie("rapporteringstype");

export enum Rapporteringstype {
  harAktivitet = "harAktivitet",
  harIngenAktivitet = "harIngenAktivitet",
}

export async function getRapporteringstype(
  request: Request
): Promise<Rapporteringstype | undefined> {
  const cookieHeader = request.headers.get("Cookie");

  const cookie = (await rapporteringstypeCookie.parse(cookieHeader)) || {};
  return cookie["rapporteringstype"];
}

export async function setRapporteringstype(
  cookieHeader: string,
  rapporteringstype: Rapporteringstype | undefined
): Promise<string> {
  const cookie = (await rapporteringstypeCookie.parse(cookieHeader)) || {};

  cookie["rapporteringstype"] = rapporteringstype;
  return rapporteringstypeCookie.serialize(cookie);
}

export async function resetRapporteringstypeCookie() {
  return rapporteringstypeCookie.serialize("", { maxAge: 0 });
}
