import { logErrorResponse } from "~/models/logger.server";
import { IAktivitet } from "~/utils/aktivitettype.utils";
import { DP_RAPPORTERING_URL, getEnv } from "~/utils/env.utils";
import { getHeaders } from "~/utils/fetch.utils";
import { IRapporteringsperiodeStatus, KortType, Rapporteringstype } from "~/utils/types";

export interface IPeriode {
  fraOgMed: string;
  tilOgMed: string;
}

export interface IRapporteringsperiodeDag {
  dagIndex: number;
  dato: string;
  aktiviteter: IAktivitet[];
}

type Type = (typeof KortType)[keyof typeof KortType];

export interface IRapporteringsperiode {
  id: string;
  type: Type;
  periode: IPeriode;
  dager: IRapporteringsperiodeDag[];
  sisteFristForTrekk: string | null;
  kanSendesFra: string;
  kanSendes: boolean;
  kanEndres: boolean;
  bruttoBelop: number | null;
  begrunnelseEndring: string | null;
  status: IRapporteringsperiodeStatus;
  mottattDato: string | null;
  registrertArbeidssoker: boolean | null;
  originalId: string | null;
  html: string | null;
  rapporteringstype: Rapporteringstype | null;
}

export interface IInnsendtRapporteringsperiodeResponse {
  id: string;
  status: InnsendtRapporteringsperiodeStatus;
  feil: IInnsendtRapporteringsperiodeFeil[];
}

export interface IInnsendtRapporteringsperiodeFeil {
  kode: string;
  params: string[];
}

export enum InnsendtRapporteringsperiodeStatus {
  OK = "OK",
  FEIL = "FEIL",
}

export async function startUtfylling(request: Request, periodeId: string): Promise<Response> {
  const url = `${DP_RAPPORTERING_URL}/rapporteringsperiode/${periodeId}/start`;

  const response = await fetch(url, {
    method: "POST",
    headers: await getHeaders(request),
  });

  if (!response.ok) {
    await logErrorResponse(response, `Klarte ikke å starte utfylling`);
    throw new Response(`rapportering-feilmelding-start-utfylling`, {
      status: response.status,
    });
  }

  return response;
}

export async function hentRapporteringsperioder(
  request: Request,
): Promise<IRapporteringsperiode[]> {
  const url = `${DP_RAPPORTERING_URL}/rapporteringsperioder`;

  const response = await fetch(url, {
    method: "GET",
    headers: await getHeaders(request),
  });

  if (!response.ok) {
    await logErrorResponse(response, `Klarte ikke å hente rapporteringsperioder`);
    throw new Response(`rapportering-feilmelding-hent-perioder`, {
      status: response.status,
    });
  }

  if (response.status === 204) {
    await logErrorResponse(response, `Hentet rapporteringsperioder men bruker har ingen perioder`);
    throw new Response("rapportering-feilmelding-hent-perioder-404", { status: 404 });
  }

  const rapporteringsperioder: IRapporteringsperiode[] = await response.json();
  // if (getEnv("RUNTIME_ENVIRONMENT") === "development") {
  //   return rapporteringsperioder.map((periode) => ({
  //     ...periode,
  //     kanSendes: true,
  //   }));
  // }

  return rapporteringsperioder;
}

export async function hentPeriode(
  request: Request,
  periodeId: string,
  hentOriginal: boolean = true,
  operasjon: string = "",
): Promise<{ periode: IRapporteringsperiode; response: Response }> {
  const url = `${DP_RAPPORTERING_URL}/rapporteringsperiode/${periodeId}`;
  const response = await fetch(url, {
    method: "GET",
    headers: await getHeaders(request, {
      "Hent-Original": hentOriginal,
      Operasjon: operasjon,
    }),
  });

  if (response.status === 404) {
    await logErrorResponse(response, `Klarte ikke å hente periode`);
    throw new Response("rapportering-feilmelding-hent-meldekort-404", { status: response.status });
  }

  if (!response.ok) {
    await logErrorResponse(response, `Feil ved henting av periode`);
    throw new Response("rapportering-feilmelding-hent-meldekort-500", { status: 500 });
  }

  const periode: IRapporteringsperiode = await response.json();

  // Forberedelse til å sende ved response, slik at kallende funksjon kan hente ut headers og x_corralationId
  if (getEnv("RUNTIME_ENVIRONMENT") === "development") {
    return {
      periode: {
        ...periode,
        kanSendes: true,
      },
      response,
    };
  }

  return { periode, response };
}

export async function hentInnsendtePerioder(request: Request): Promise<IRapporteringsperiode[]> {
  const url = `${DP_RAPPORTERING_URL}/rapporteringsperioder/innsendte`;

  const response = await fetch(url, {
    method: "GET",
    headers: await getHeaders(request),
  });

  if (!response.ok) {
    await logErrorResponse(response, `Klarte ikke å hente innsendte perioder`);
    throw new Response("rapportering-feilmelding-hent-innsendte-meldekort-500", {
      status: 500,
    });
  }

  if (response.status === 204) {
    return [];
  }

  return await response.json();
}

export async function sendInnPeriode(
  request: Request,
  rapporteringsperiode: IRapporteringsperiode,
): Promise<IInnsendtRapporteringsperiodeResponse> {
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
  const githubSha = process.env.GITHUB_SHA || "UKJENT";
  const userAgent = request.headers.get("User-Agent") || "UKJENT";

  const headers = {
    ...standardHeaders,
    githubSha,
    userAgent,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(rapporteringsperiodeWithHtml),
  });

  if (!response.ok) {
    await logErrorResponse(response, `Klarte ikke å sende inn periode`);
    throw new Response(`rapportering-feilmelding-send-inn-periode`, {
      status: response.status,
    });
  }

  return response.json();
}

export async function lagEndringsperiode(
  request: Request,
  periodeId: string,
): Promise<IRapporteringsperiode> {
  const url = `${DP_RAPPORTERING_URL}/rapporteringsperiode/${periodeId}/endre`;

  const response = await fetch(url, {
    method: "POST",
    headers: await getHeaders(request),
  });

  if (!response.ok) {
    await logErrorResponse(response, `Klarte ikke å hente innsendte perioder`);
    throw new Response(`rapportering-feilmelding-lag-endringsperiode`, {
      status: response.status,
    });
  }

  return response.json();
}
