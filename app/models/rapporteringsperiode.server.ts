import type { IAktivitet } from "./aktivitet.server";
import { DP_RAPPORTERING_URL } from "~/utils/env.utils";
import { getHeaders } from "~/utils/fetch.utils";
import { Rapporteringstype } from "~/utils/types";

export interface IPeriode {
  fraOgMed: string;
  tilOgMed: string;
}

export enum IRapporteringsperiodeStatus {
  TilUtfylling = "TilUtfylling",
  Innsendt = "Innsendt",
  Endret = "Endret",
}

export interface IRapporteringsperiode {
  id: string;
  periode: IPeriode;
  dager: IRapporteringsperiodeDag[];
  status: IRapporteringsperiodeStatus;
  kanSendesFra: string;
  kanSendes: boolean;
  kanEndres: boolean;
  rapporteringstype: Rapporteringstype | null;
  begrunnelseEndring?: string;
  registrertArbeidssoker: boolean | null;
  originalId?: string;
  html?: string;
}

export interface IRapporteringsperiodeDag {
  dagIndex: number;
  dato: string;
  aktiviteter: IAktivitet[];
}

export async function startUtfylling(request: Request, periodeId: string): Promise<Response> {
  const url = `${DP_RAPPORTERING_URL}/rapporteringsperiode/${periodeId}/start`;

  return await fetch(url, {
    method: "POST",
    headers: await getHeaders(request),
  });
}

export async function hentRapporteringsperioder(
  request: Request
): Promise<IRapporteringsperiode[]> {
  const url = `${DP_RAPPORTERING_URL}/rapporteringsperioder`;

  const response = await fetch(url, {
    method: "GET",
    headers: await getHeaders(request),
  });

  if (!response.ok) {
    throw new Response(`rapportering-feilmelding-hent-perioder-${response.status}`, {
      status: response.status,
    });
  }

  if (response.status === 204) {
    throw new Response("rapportering-feilmelding-hent-perioder-404", { status: 404 });
  }

  const rapporteringsperioder: IRapporteringsperiode[] = await response.json();

  return rapporteringsperioder;
}

export async function hentPeriode(
  request: Request,
  periodeId: string,
  hentOriginal: boolean = true
): Promise<IRapporteringsperiode> {
  const url = `${DP_RAPPORTERING_URL}/rapporteringsperiode/${periodeId}`;

  const response = await fetch(url, {
    method: "GET",
    headers: await getHeaders(request, {
      "Hent-Original": hentOriginal,
    }),
  });

  if (!response.ok) {
    throw new Response("rapportering-feilmelding-hent-meldekort-500", { status: 500 });
  }

  const periode: IRapporteringsperiode = await response.json();

  if (!periode) {
    throw new Response("rapportering-feilmelding-hent-meldekort-404", { status: 404 });
  }

  return periode;
}

export async function hentInnsendtePerioder(request: Request): Promise<IRapporteringsperiode[]> {
  const url = `${DP_RAPPORTERING_URL}/rapporteringsperioder/innsendte`;

  const respone = await fetch(url, {
    method: "GET",
    headers: await getHeaders(request),
  });

  if (!respone.ok) {
    throw new Response("rapportering-feilmelding-hent-innsendte-meldekort-500", {
      status: 500,
    });
  }
  if (respone.status === 204) {
    return [];
  }

  return await respone.json();
}

export async function sendInnPeriode(
  request: Request,
  rapporteringsperiode: IRapporteringsperiode
): Promise<Response> {
  const url = `${DP_RAPPORTERING_URL}/rapporteringsperiode`;

  const formData = await request.formData();
  const html = formData.get("_html");
  if (html === null || html.toString().trim() === "") {
    throw new Error("Kunne ikke finne HTML med tekstene");
  }

  const rapporteringsperiodeWithHtml = {
    ...rapporteringsperiode,
    html: html.toString().trim(),
  };

  const standardHeaders = await getHeaders(request);
  const githubSha = process.env.GITHUB_SHA || "";
  const userAgent = request.headers.get("User-Agent") || "";

  const headers = {
    ...standardHeaders,
    githubSha,
    userAgent,
  };

  return await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(rapporteringsperiodeWithHtml),
  });
}

export async function lagEndringsperiode(request: Request, periodeId: string) {
  const url = `${DP_RAPPORTERING_URL}/rapporteringsperiode/${periodeId}/endre`;

  return await fetch(url, {
    method: "POST",
    headers: await getHeaders(request),
  });
}
