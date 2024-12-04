import { logErrorResponse } from "~/models/logger.server";
import { getEnv } from "~/utils/env.utils";
import { getCorrelationId, getHeaders } from "~/utils/fetch.utils";
import type { INetworkResponse } from "~/utils/types";

import { IRapporteringsperiodeDag } from "./rapporteringsperiode.server";

export async function lagreAktivitet(
  request: Request,
  rapporteringsperiodeId: string,
  dag: IRapporteringsperiodeDag,
): Promise<INetworkResponse> {
  const url = `${getEnv(
    "DP_RAPPORTERING_URL",
  )}/rapporteringsperiode/${rapporteringsperiodeId}/aktivitet`;

  const response = await fetch(url, {
    method: "POST",
    headers: await getHeaders(request),
    body: JSON.stringify({ ...dag }),
  });

  if (!response.ok) {
    const id = await getCorrelationId(response);
    await logErrorResponse(response, `Feil ved lagring av aktivitet`);
    return {
      status: "error",
      error: {
        statusCode: response.status,
        statusText: `rapportering-feilmelding-lagre-aktivitet`,
      },
      id,
    };
  }

  return { status: "success" };
}
