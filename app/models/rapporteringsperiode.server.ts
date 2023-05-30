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
  aktiviteter: IAktivitet[];
}

interface IRapporteringsperiodeDag {
  dagIndex: number;
  dato: string;
  muligeAktiviteter: TAktivitetType[];
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
    const respons = await response.json();
    logger.info("respons feilet: ", respons);
    throw new Response(`Feil ved kall til ${url}`, {
      status: response.status,
      statusText: response.statusText,
    });
  }
  const respons = await response.json();
  logger.info("respons ok: ", respons);

  return respons;
}
