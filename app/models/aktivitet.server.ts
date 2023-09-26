import { getEnv } from "~/utils/env.utils";
import { getHeader } from "~/utils/fetch.utils";

export type TAktivitetType = "Arbeid" | "Syk" | "Ferie";

export interface IAktivitet {
  id?: string;
  type: TAktivitetType;
  timer?: string;
  dato: string;
}

export interface IActionData {
  status: "success" | "error";
  error?: string;
}

export async function lagreAktivitet(
  onBehalfOfToken: string,
  rapporteringsperiodeId: string,
  aktivitet: IAktivitet
): Promise<IActionData> {
  const url = `${getEnv(
    "DP_RAPPORTERING_URL"
  )}/rapporteringsperioder/${rapporteringsperiodeId}/aktivitet`;

  const response = await fetch(url, {
    method: "POST",
    headers: getHeader(onBehalfOfToken),
    body: JSON.stringify({ ...aktivitet }),
  });

  if (!response.ok) {
    return { status: "error", error: "Det har skjedd en feil ved sletting, prøv igjen." };
  }

  return { status: "success" };
}

export async function sletteAktivitet(
  onBehalfOfToken: string,
  rapporteringsperiodeId: string,
  aktivitetId: String
): Promise<IActionData> {
  const url = `${getEnv(
    "DP_RAPPORTERING_URL"
  )}/rapporteringsperioder/${rapporteringsperiodeId}/aktivitet/${aktivitetId}`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: getHeader(onBehalfOfToken),
  });

  if (!response.ok) {
    return { status: "error", error: "Det har skjedd en feil ved sletting, prøv igjen." };
  }

  return { status: "success" };
}
