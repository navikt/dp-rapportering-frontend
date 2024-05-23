import type { AktivitetType, IAktivitet } from "./aktivitet.server";
import { getEnv } from "~/utils/env.utils";
import { getHeaders } from "~/utils/fetch.utils";

export interface IRapporteringsperiode {
  beregnesEtter: string;
  id: string;
  fraOgMed: string;
  tilOgMed: string;
  status: string;
  dager: IRapporteringsperiodeDag[];
}

export interface IRapporteringsperiodeDag {
  dagIndex: number;
  dato: string;
  muligeAktiviteter: AktivitetType[];
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

export async function hentAllePerioder(onBehalfOfToken: string): Promise<Response> {
  const url = `${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder`;

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
