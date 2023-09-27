import { getEnv } from "~/utils/env.utils";
import { getHeader } from "~/utils/fetch.utils";
import type { IAktivitet, TAktivitetType } from "./aktivitet.server";

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
  muligeAktiviteter: TAktivitetType[];
  aktiviteter: IAktivitet[];
}

export async function hentGjeldendePeriode(onBehalfOfToken: string): Promise<Response> {
  const url = `${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder/gjeldende`;

  return await fetch(url, {
    method: "GET",
    headers: getHeader(onBehalfOfToken),
  });
}
export async function hentPeriode(onBehalfOfToken: string, periodeId: string): Promise<Response> {
  const url = `${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder/${periodeId}`;

  return await fetch(url, {
    method: "GET",
    headers: getHeader(onBehalfOfToken),
  });
}

export async function hentAllePerioder(onBehalfOfToken: string): Promise<Response> {
  const url = `${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder`;

  return await fetch(url, {
    method: "GET",
    headers: getHeader(onBehalfOfToken),
  });
}

export async function godkjennPeriode(onBehalfOfToken: string, id: string): Promise<Response> {
  const url = `${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder/${id}/godkjenn`;

  return await fetch(url, {
    method: "POST",
    headers: getHeader(onBehalfOfToken),
  });
}

export async function avGodkjennPeriode(
  onBehalfOfToken: string,
  periodeId: string
): Promise<Response> {
  const url = `${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder/${periodeId}/avgodkjenn`;

  return await fetch(url, {
    method: "POST",
    headers: getHeader(onBehalfOfToken),
  });
}

export async function lagKorrigeringsperiode(onBehalfOfToken: string, periodeId: string) {
  const url = `${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder/${periodeId}/korrigering`;

  const response = await fetch(url, {
    method: "POST",
    headers: getHeader(onBehalfOfToken),
  });

  return response;
}
