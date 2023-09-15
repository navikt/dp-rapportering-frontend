import { getEnv } from "~/utils/env.utils";
import type { IAktivitet, IAktivitetType } from "./aktivitet.server";

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
  muligeAktiviteter: IAktivitetType[];
  aktiviteter: IAktivitet[];
}

export async function hentPeriode(
  onBehalfOfToken: string,
  periodeId: string
): Promise<IRapporteringsperiode> {
  const url = `${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder/${periodeId}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${onBehalfOfToken}`,
    },
  });

  if (!response.ok) {
    throw new Response("IIIH NOE GIKK GALT VED UTHENTING AV PERIODE");
  }

  return response.json();
}

export async function hentGjeldendePeriode(
  onBehalfOfToken: string
): Promise<IRapporteringsperiode> {
  const url = `${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder/gjeldende`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${onBehalfOfToken}`,
    },
  });

  if (!response.ok) {
    if (response.status !== 404)
      throw new Response("Feil i uthenting av gjeldende periode", {
        status: 500,
      });
  }

  return response.json();
}

export async function hentAllePerioder(onBehalfOfToken: string): Promise<IRapporteringsperiode[]> {
  const url = `${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${onBehalfOfToken}`,
    },
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
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${onBehalfOfToken}`,
    },
  });
}

export async function avGodkjennPeriode(
  onBehalfOfToken: string,
  periodeId: string
): Promise<Response> {
  const url = `${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder/${periodeId}/avgodkjenn`;

  return await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${onBehalfOfToken}`,
    },
  });
}

export async function lagKorrigeringsperiode(onBehalfOfToken: string, periodeId: string) {
  const url = `${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder/${periodeId}/korrigering`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${onBehalfOfToken}`,
    },
  });

  return response;
}
