import { logErrorResponseAsError } from "~/models/logger.server";
import { getEnv } from "~/utils/env.utils";
import { getCorrelationId, getHeaders } from "~/utils/fetch.utils";
import type { INetworkResponse } from "~/utils/types";

export interface IArbeidssokerSvar {
  registrertArbeidssoker: boolean;
}

export async function hentErRegistrertArbeidssoker(request: Request): Promise<boolean> {
  const url = `${getEnv("DP_RAPPORTERING_URL")}/erregistrertarbeidssoker`;

  const response = await fetch(url, {
    method: "GET",
    headers: await getHeaders(request),
  });

  if (!response.ok) {
    await logErrorResponseAsError(response, `Feil ved henting av arbeidssøker-status`);
    throw new Response(`rapportering-feilmelding-hent-arbeidssoker-status`, {
      status: response.status,
    });
  }

  return response.json();
}

export async function lagreArbeidssokerSvar(
  request: Request,
  rapporteringsperiodeId: string,
  svar: IArbeidssokerSvar,
): Promise<INetworkResponse> {
  const url = `${getEnv(
    "DP_RAPPORTERING_URL",
  )}/rapporteringsperiode/${rapporteringsperiodeId}/arbeidssoker`;

  const response = await fetch(url, {
    method: "POST",
    headers: await getHeaders(request),
    body: JSON.stringify({ ...svar }),
  });

  if (!response.ok) {
    const id = await getCorrelationId(response);
    await logErrorResponseAsError(response, `Feil ved lagring av arbeidssokersvar`);
    return {
      status: "error",
      error: {
        statusCode: response.status,
        statusText: `rapportering-feilmelding-lagre-arbeidssoker-svar`,
      },
      id,
    };
  }

  return { status: "success" };
}
