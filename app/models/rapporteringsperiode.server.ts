import { getRapporteringOboToken, getSession } from "~/utils/auth.utils.server";
import { getEnv } from "~/utils/env.utils";
import type { IAktivitet, TAktivitetType } from "./aktivitet.server";
import { logger } from "../../server/logger";

export interface IRapporteringsperiode {
  id: string;
  fraOgMed: string;
  tilOgMed: string;
  status: string;
  dager: IRapporteringsperiodeDag[];
}

interface IRapporteringsperiodeDag {
  dagIndex: number;
  dato: string;
  muligeAktiviteter: TAktivitetType[];
  aktiviteter: IAktivitet[];
}

export async function hentSisteRapporteringsperiode(
  id: string,
  request: Request
): Promise<IRapporteringsperiode> {
  const url = `${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder/${id}`;

  const session = await getSession(request);

  if (!session) {
    throw new Error("Feil ved henting av sessjon");
  }

  const onBehalfOfToken = await getRapporteringOboToken(session);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${onBehalfOfToken}`,
    },
  });

  if (!response.ok) {
    //kan fjernes når vi synes det logger for mye, kan hende dette brekker bygget også, vi får se :fingers_crossed:
    logger.warn("feil ved kall til rapporteringsperiode", { statustext: response.statusText });

    throw new Response(`Feil ved kall til ${url}`, {
      status: response.status,
      statusText: response.statusText,
    });
  }

  return await response.json();
}

export async function godkjennPeriode(id: string, request: Request): Promise<Response> {
  const url = `${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder/${id}/godkjenn`;

  const session = await getSession(request);

  if (!session) {
    throw new Error("Feil ved henting av sessjon");
  }

  const onBehalfOfToken = await getRapporteringOboToken(session);

  return await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${onBehalfOfToken}`,
    },
  });
}
