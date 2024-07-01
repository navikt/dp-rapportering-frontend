import type { IAktivitet } from "./aktivitet.server";
import { getEnv } from "~/utils/env.utils";
import { getHeaders } from "~/utils/fetch.utils";

export interface IPeriode {
  fraOgMed: string;
  tilOgMed: string;
}

export interface IRapporteringsperiode {
  id: string;
  periode: IPeriode;
  dager: IRapporteringsperiodeDag[];
  status: "TilUtfylling" | "Innsendt" | "Korrigert";
  kanSendesFra: string;
  kanSendes: boolean;
  kanKorrigeres: boolean;
  registrertArbeidssoker: boolean | null;
}

export interface IRapporteringsperiodeDag {
  dagIndex: number;
  dato: string;
  aktiviteter: IAktivitet[];
}

export async function hentRapporteringsperioder(request: Request): Promise<Response> {
  const url = `${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder`;

  return await fetch(url, {
    method: "GET",
    headers: await getHeaders(request),
  });
}

export async function hentPeriode(request: Request, periodeId: string): Promise<Response> {
  const url = `${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperiode/${periodeId}`;

  return await fetch(url, {
    method: "GET",
    headers: await getHeaders(request),
  });
}

function getInnsendtePeriodeUrl(request: Request) {
  const requestUrl = new URL(request.url);
  const scenerio = requestUrl.searchParams.get("scenerio");

  if (scenerio) {
    const url = `${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder/innsendte?scenerio=${scenerio}`;
    return url;
  }

  return `${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder/innsendte`;
}

export async function hentInnsendtePerioder(request: Request): Promise<Response> {
  const url = getInnsendtePeriodeUrl(request);

  return await fetch(url, {
    method: "GET",
    headers: await getHeaders(request),
  });
}

export async function sendInnPeriode(
  request: Request,
  rapporteringsperiode: IRapporteringsperiode
): Promise<Response> {
  const url = `${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperiode`;

  return await fetch(url, {
    method: "POST",
    headers: await getHeaders(request),
    body: JSON.stringify(rapporteringsperiode),
  });
}

export async function lagKorrigeringsperiode(request: Request, periodeId: string) {
  const url = `${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder/${periodeId}/korrigering`;

  const response = await fetch(url, {
    method: "POST",
    headers: await getHeaders(request),
  });

  return response;
}
