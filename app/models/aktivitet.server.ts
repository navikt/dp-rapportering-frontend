import { getEnv } from "~/utils/env.utils";

export type IAktivitetType = "Arbeid" | "Syk" | "Ferie";

export interface IAktivitet {
  id?: string;
  type: IAktivitetType;
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
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${onBehalfOfToken}`,
    },
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
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${onBehalfOfToken}`,
    },
  });
}
