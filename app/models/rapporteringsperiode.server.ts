import { getEnv } from "~/utils/env.utils";

export type TAktivitetType = "Arbeid" | "Sykdom" | "Ferie";

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

export interface IAktivitet {
  id?: string;
  type: TAktivitetType;
  timer: string;
  dato: string;
}

export async function hentRapporteringsperioder(): Promise<
  IRapporteringsperiode[]
> {
  const url = `${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder`;

  const response = await fetch(url);

  const data = await response.json();
  console.log(data);

  if (!response.ok) {
    throw new Response(`Feil ved kall til ${url}`, {
      status: response.status,
      statusText: response.statusText,
    });
  }

  return await data;
}
