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

export async function slettAlleAktiviteterForRapporteringsperioden(
  request: Request,
  rapporteringsPeriodeId: string,
): Promise<INetworkResponse> {
  const url = `${getEnv(
    "DP_RAPPORTERING_URL",
  )}/rapporteringsperiode/${rapporteringsPeriodeId}/aktiviteter`;

  const response = await fetch(url, {
    method: "delete",
    headers: await getHeaders(request),
  });

  if (!response.ok) {
    const id = await getCorrelationId(response);
    await logErrorResponse(response, `Feil ved sletting av aktiviter`);
    return {
      status: "error",
      error: {
        statusCode: response.status,
        statusText: `rapportering-feilmelding-lagre-aktivitet`, // TODO: sjekk om bruker skal få feilmelding og i så tilfelle hvilket innhold
      },
      id,
    };
  }

  return { status: "success" };
}
