import type { IAktivitet } from "./aktivitet.server";
import { getEnv } from "~/utils/env.utils";
import { getHeaders } from "~/utils/fetch.utils";

interface IPeriode {
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
}

export interface IRapporteringsperiodeDag {
  dagIndex: number;
  dato: string;
  aktiviteter: IAktivitet[];
}

export async function hentGjeldendePeriode(onBehalfOfToken: string): Promise<Response> {
  const url = `${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder/gjeldende`;

  return await fetch(url, {
    method: "GET",
    headers: getHeaders(onBehalfOfToken),
  });
}
export async function hentPeriode(onBehalfOfToken: string, periodeId: string): Promise<Response> {
  const url = `${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder/${periodeId}`;

  return await fetch(url, {
    method: "GET",
    headers: getHeaders(onBehalfOfToken),
  });
}

export async function hentInnsendtePerioder(onBehalfOfToken: string): Promise<Response> {
  const url = `${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder/innsendte`;

  return await fetch(url, {
    method: "GET",
    headers: getHeaders(onBehalfOfToken),
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
