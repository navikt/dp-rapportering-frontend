import { getEnv } from "~/utils/env.utils";
import { getHeaders } from "~/utils/fetch.utils";
import type { INetworkResponse } from "~/utils/types";

export interface BegrunnelseSvar {
  begrunnelseEndring: string;
}

export async function lagreBegrunnelse(
  request: Request,
  rapporteringsperiodeId: string,
  begrunnelseEndring: string
): Promise<INetworkResponse> {
  const url = `${getEnv(
    "DP_RAPPORTERING_URL"
  )}/rapporteringsperiode/${rapporteringsperiodeId}/begrunnelse`;

  const response = await fetch(url, {
    method: "POST",
    headers: await getHeaders(request),
    body: JSON.stringify({ begrunnelseEndring }),
  });

  if (!response.ok) {
    return {
      status: "error",
      error: {
        statusCode: response.status,
        statusText: "Det har skjedd en feil ved lagring av begrunnelse, prøv igjen.",
      },
    };
  }

  return { status: "success" };
}
