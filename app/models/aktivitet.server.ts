import { IRapporteringsperiodeDag } from "./rapporteringsperiode.server";
import { aktivitetType } from "~/utils/aktivitettype.utils";
import { getEnv } from "~/utils/env.utils";
import { getHeaders } from "~/utils/fetch.utils";
import type { INetworkResponse } from "~/utils/types";

export type AktivitetType = (typeof aktivitetType)[number];

export interface IAktivitet {
  id?: string;
  type: AktivitetType;
  timer?: string;
}

export async function lagreAktivitet(
  request: Request,
  rapporteringsperiodeId: string,
  dag: IRapporteringsperiodeDag
): Promise<INetworkResponse> {
  const url = `${getEnv(
    "DP_RAPPORTERING_URL"
  )}/rapporteringsperiode/${rapporteringsperiodeId}/aktivitet`;

  const response = await fetch(url, {
    method: "POST",
    headers: await getHeaders(request),
    body: JSON.stringify({ ...dag }),
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
  request: Request,
  rapporteringsperiodeId: string,
  aktivitetId: string
): Promise<INetworkResponse> {
  const url = `${getEnv(
    "DP_RAPPORTERING_URL"
  )}/rapporteringsperiode/${rapporteringsperiodeId}/aktivitet/${aktivitetId}`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: await getHeaders(request),
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
