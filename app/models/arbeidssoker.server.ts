import { getEnv } from "~/utils/env.utils";
import { getHeaders } from "~/utils/fetch.utils";
import type { INetworkResponse } from "~/utils/types";

export interface ArbeidssokerSvar {
  registrertArbeidssoker: boolean;
}

export async function lagreArbeidssokerSvar(
  onBehalfOfToken: string,
  rapporteringsperiodeId: string,
  svar: ArbeidssokerSvar
): Promise<INetworkResponse> {
  const url = `${getEnv(
    "DP_RAPPORTERING_URL"
  )}/rapporteringsperiode/${rapporteringsperiodeId}/arbeidssoker`;

  const response = await fetch(url, {
    method: "POST",
    headers: getHeaders(onBehalfOfToken),
    body: JSON.stringify({ ...svar }),
  });

  if (!response.ok) {
    return {
      status: "error",
      error: {
        statusCode: response.status,
        statusText: "Det har skjedd en feil ved lagring av arbeidssøker svar, prøv igjen.",
      },
    };
  }

  return { status: "success" };
}
