import type { IAktivitet } from "./aktivitet.server";
import { getSessionId } from "mocks/session";
import { getRapporteringOboToken } from "~/utils/auth.utils.server";
import { getEnv, isLocalOrDemo } from "~/utils/env.utils";
import { getHeaders } from "~/utils/fetch.utils";

export interface IPeriode {
  fraOgMed: string;
  tilOgMed: string;
}

export interface IRapporteringsperiode {
  id: string;
  periode: IPeriode;
  dager: IRapporteringsperiodeDag[];
  status: "TilUtfylling" | "Innsendt";
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
  const onBehalfOfToken = await getRapporteringOboToken(request);

  const url = `${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder`;

  const headers = isLocalOrDemo
    ? { ...getHeaders(onBehalfOfToken), Cookie: `sessionId=${getSessionId(request)}` }
    : getHeaders(onBehalfOfToken);

  return await fetch(url, {
    method: "GET",
    headers,
  });
}

function getGjeldendePeriodeUrl(request: Request) {
  const requestUrl = new URL(request.url);
  const scenerio = requestUrl.searchParams.get("scenerio");

  if (scenerio) {
    const url = `${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperiode/gjeldende?scenerio=${scenerio}`;
    return url;
  }

  return `${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperiode/gjeldende`;
}

export async function hentGjeldendePeriode(request: Request): Promise<Response> {
  const onBehalfOfToken = await getRapporteringOboToken(request);

  const url = getGjeldendePeriodeUrl(request);

  return await fetch(url, {
    method: "GET",
    headers: getHeaders(onBehalfOfToken),
  });
}
export async function hentPeriode(onBehalfOfToken: string, periodeId: string): Promise<Response> {
  const url = `${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperiode/${periodeId}`;

  return await fetch(url, {
    method: "GET",
    headers: getHeaders(onBehalfOfToken),
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
  const onBehalfOfToken = await getRapporteringOboToken(request);

  const url = getInnsendtePeriodeUrl(request);

  return await fetch(url, {
    method: "GET",
    headers: getHeaders(onBehalfOfToken),
  });
}

export async function sendInnPeriode(
  onBehalfOfToken: string,
  rapporteringsperiode: IRapporteringsperiode
): Promise<Response> {
  const url = `${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperiode`;

  return await fetch(url, {
    method: "POST",
    headers: getHeaders(onBehalfOfToken),
    body: JSON.stringify(rapporteringsperiode),
  });
}

export async function godkjennPeriode(onBehalfOfToken: string, id: string): Promise<Response> {
  const url = `${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder/${id}/godkjenn`;

  return await fetch(url, {
    method: "POST",
    headers: getHeaders(onBehalfOfToken),
    body: JSON.stringify({ image: getEnv("NAIS_APP_IMAGE"), commit: getEnv("COMMIT") }),
  });
}

export async function avGodkjennPeriode(
  onBehalfOfToken: string,
  periodeId: string
): Promise<Response> {
  const url = `${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder/${periodeId}/avgodkjenn`;

  return await fetch(url, {
    method: "POST",
    headers: getHeaders(onBehalfOfToken),
  });
}

export async function lagKorrigeringsperiode(onBehalfOfToken: string, periodeId: string) {
  const url = `${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder/${periodeId}/korrigering`;

  const response = await fetch(url, {
    method: "POST",
    headers: getHeaders(onBehalfOfToken),
  });

  return response;
}
