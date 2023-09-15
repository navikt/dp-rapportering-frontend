import { getEnv } from "~/utils/env.utils";
import type { IAktivitet, TAktivitetType } from "./aktivitet.server";
import { getHeader } from "~/utils/fetch.utils";

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

export async function hentPeriode(
  onBehalfOfToken: string,
  periodeId: string
): Promise<IRapporteringsperiode> {
  const url = `${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder/${periodeId}`;

  const response = await fetch(url, {
    method: "GET",
    headers: getHeader(onBehalfOfToken),
  });

  if (!response.ok) {
    throw new Response("Noe gikk galt ved uthenting av periode");
  }

  return response.json();
}

export async function hentGjeldendePeriode(
  onBehalfOfToken: string
): Promise<IRapporteringsperiode | null> {
  const url = `${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder/gjeldende`;

  const response = await fetch(url, {
    method: "GET",
    headers: getHeader(onBehalfOfToken),
  });

  if (!response.ok) {
    // 404 betyr ingen gjeldende periode
    if (response.status === 404) {
      return null;
    } else {
      throw new Response("Feil i uthenting av gjeldende periode", {
        status: 500,
      });
    }
  }

  return response.json();
}

export async function hentAllePerioder(onBehalfOfToken: string): Promise<IRapporteringsperiode[]> {
  const url = `${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder`;

  const response = await fetch(url, {
    method: "GET",
    headers: getHeader(onBehalfOfToken),
  });

  if (!response.ok) {
    throw new Response("Feil i uthenting av alle perioder", {
      status: 500,
    });
  }

  return response.json();
}

export async function godkjennPeriode(
  onBehalfOfToken: string,
  periodeId: string
): Promise<Response> {
  const url = `${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder/${periodeId}/godkjenn`;

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
