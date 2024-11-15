import { logErrorResponse } from "~/models/logger.server";
import { getEnv } from "~/utils/env.utils";
import { getCorrelationId, getHeaders } from "~/utils/fetch.utils";
import { Rapporteringstype } from "~/utils/types";

export interface IRapporteringstypeSvar {
  rapporteringstype: Rapporteringstype;
}

export async function lagreRapporteringstype(
  request: Request,
  rapporteringsperiodeId: string,
  rapporteringstype: Rapporteringstype
): Promise<Response> {
  const url = `${getEnv(
    "DP_RAPPORTERING_URL"
  )}/rapporteringsperiode/${rapporteringsperiodeId}/rapporteringstype`;

  const response = await fetch(url, {
    method: "POST",
    headers: await getHeaders(request),
    body: JSON.stringify({ rapporteringstype }),
  });

  if (!response.ok) {
    const id = await getCorrelationId(response);
    await logErrorResponse(response, `Feil ved lagring av rapporteringstype`);
    return Response.json({
      status: "error",
      error: {
        statusCode: response.status,
        statusText: `rapportering-feilmelding-lagre-rapporteringstype`,
      },
      id,
    });
  }

  return Response.json({ status: "success" });
}
