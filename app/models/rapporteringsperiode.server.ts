import { getRapporteringOboToken, getSession } from "~/utils/auth.utils.server";
import { getEnv } from "~/utils/env.utils";
import type { IAktivitet, TAktivitetType } from "./aktivitet.server";

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
    throw new Response(`Feil ved kall til ${url}`, {
      status: response.status,
      statusText: response.statusText,
    });
  }

  return await response.json();
}
