import { getEnv } from "~/utils/env.utils";
import { IAktivitet, TAktivitetType } from "./aktivitet.server";

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

export async function hentSisteRapporteringsperiode(): Promise<IRapporteringsperiode> {
  const url = `${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder`;

  const response = await fetch(url);

  const data = await response.json();

  if (!response.ok) {
    throw new Response(`Feil ved kall til ${url}`, {
      status: response.status,
      statusText: response.statusText,
    });
  }

  return data[0];
}
