import { getEnv } from "~/utils/env.utils";
import { getHeaders } from "~/utils/fetch.utils";
import type { INetworkResponse } from "~/utils/types";

export type AktivitetType = "Arbeid" | "Syk" | "Utdanning" | "Fravaer";

export interface IAktivitet {
  id?: string;
  type: AktivitetType;
  timer?: string;
}

export async function lagreAktivitet(
  onBehalfOfToken: string,
  rapporteringsperiodeId: string,
  aktivitet: IAktivitet
): Promise<INetworkResponse> {
  const url = `${getEnv(
    "DP_RAPPORTERING_URL"
  )}/rapporteringsperioder/${rapporteringsperiodeId}/aktivitet`;

  const response = await fetch(url, {
    method: "POST",
    headers: getHeaders(onBehalfOfToken),
    body: JSON.stringify({ ...aktivitet }),
  });

  if (!response.ok) {
    return {
      status: "error",
      error: {
        statusCode: response.status,
        statusText: "Det har skjedd en feil ved lagring av aktivitet, prøv igjen.",
      },
    };
  }

  return { status: "success" };
}

export async function sletteAktivitet(
  onBehalfOfToken: string,
  rapporteringsperiodeId: string,
  aktivitetId: string
): Promise<INetworkResponse> {
  const url = `${getEnv(
    "DP_RAPPORTERING_URL"
  )}/rapporteringsperioder/${rapporteringsperiodeId}/aktivitet/${aktivitetId}`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: getHeaders(onBehalfOfToken),
  });

  if (!response.ok) {
    return {
      status: "error",
      error: {
        statusCode: response.status,
        statusText: "Det har skjedd en feil ved sletting, prøv igjen.",
      },
    };
  }

  return { status: "success" };
}
