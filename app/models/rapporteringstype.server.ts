import { logErrorResponse } from "~/models/logger.server";
import { getEnv } from "~/utils/env.utils";
import { getHeaders } from "~/utils/fetch.utils";
import { INetworkResponse, Rapporteringstype } from "~/utils/types";

export interface IRapporteringstypeSvar {
  rapporteringstype: Rapporteringstype;
}

export async function lagreRapporteringstype(
  request: Request,
  rapporteringsperiodeId: string,
  rapporteringstype: Rapporteringstype
): Promise<INetworkResponse> {
  const url = `${getEnv(
    "DP_RAPPORTERING_URL"
  )}/rapporteringsperiode/${rapporteringsperiodeId}/rapporteringstype`;

  const response = await fetch(url, {
    method: "POST",
    headers: await getHeaders(request),
    body: JSON.stringify({ rapporteringstype }),
  });

  if (!response.ok) {
    logErrorResponse(response, `Feil ved lagring av rapporteringstype`);
    return {
      status: "error",
      error: {
        statusCode: response.status,
        statusText: `rapportering-feilmelding-lagre-rapporteringstype`,
      },
    };
  }

  return { status: "success" };
}
