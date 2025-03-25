import { getEnv } from "~/utils/env.utils";
import { getCorrelationId, getHeaders } from "~/utils/fetch.utils";
import { INetworkResponse } from "~/utils/types";

import { logErrorResponse } from "./logger.server";
import { IRapporteringsperiode } from "./rapporteringsperiode.server";

export async function slettAlleAktiviteter(
  request: Request,
  rapporteringsperiode: IRapporteringsperiode,
): Promise<INetworkResponse> {
  console.log("helloo");
  const url = `${getEnv(
    "DP_RAPPORTERING_URL",
  )}/rapporteringsperiode/${rapporteringsperiode.id}/aktiviter`;

  const oppdatertDager = rapporteringsperiode.dager.map((d) => {
    return { ...d, aktiviteter: [] };
  });

  const response = await fetch(url, {
    method: "POST",
    headers: await getHeaders(request),
    body: JSON.stringify({ ...oppdatertDager }),
  });

  if (!response.ok) {
    const id = await getCorrelationId(response);
    await logErrorResponse(response, `Feil ved sletting av aktiviter`);
    return {
      status: "error",
      error: {
        statusCode: response.status,
        statusText: `rapportering-feilmelding-lagre-aktivitet`, // TODO: legg til ny feilmelding i sanity
      },
      id,
    };
  }

  return { status: "success" };
}
