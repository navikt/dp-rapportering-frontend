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
  status: "TilUtfylling" | "Innsendt" | "Endret";
  kanSendesFra: string;
  kanSendes: boolean;
  kanEndres: boolean;
  registrertArbeidssoker: boolean | null;
}

export interface IRapporteringsperiodeDag {
  dagIndex: number;
  dato: string;
  aktiviteter: IAktivitet[];
}

export async function startUtfylling(request: Request, periodeId: string): Promise<Response> {
  const url = `${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperiode/${periodeId}/start`;

  return await fetch(url, {
    method: "POST",
    headers: await getHeaders(request),
  });
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

export async function hentInnsendtePerioder(request: Request): Promise<Response> {
  const url = `${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder/innsendte`;

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

export async function lagEndringsperiode(request: Request, periodeId: string) {
  const url = `${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperiode/${periodeId}/endre`;

  const response = await fetch(url, {
    method: "POST",
    headers: await getHeaders(request),
  });

  return response;
}
