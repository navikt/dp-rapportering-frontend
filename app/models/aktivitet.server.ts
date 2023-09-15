import { getEnv } from "~/utils/env.utils";
import { getHeader } from "~/utils/fetch.utils";

export type TAktivitetType = "Arbeid" | "Syk" | "Ferie";

export interface IAktivitet {
  id?: string;
  type: TAktivitetType;
  timer?: string;
  dato: string;
}

export async function lagreAktivitet(
  onBehalfOfToken: string,
  rapporteringsperiodeId: string,
  aktivitet: IAktivitet
): Promise<Response> {
  const url = `${getEnv(
    "DP_RAPPORTERING_URL"
  )}/rapporteringsperioder/${rapporteringsperiodeId}/aktivitet`;

  return await fetch(url, {
    method: "POST",
    headers: getHeader(onBehalfOfToken),
    body: JSON.stringify({ ...aktivitet }),
  });
}

export async function sletteAktivitet(
  onBehalfOfToken: string,
  rapporteringsperiodeId: string,
  aktivitetId: String
): Promise<Response> {
  const url = `${getEnv(
    "DP_RAPPORTERING_URL"
  )}/rapporteringsperioder/${rapporteringsperiodeId}/aktivitet/${aktivitetId}`;

  return await fetch(url, {
    method: "DELETE",
    headers: getHeader(onBehalfOfToken),
  });
}
