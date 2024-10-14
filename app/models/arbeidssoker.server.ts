import { getEnv } from "~/utils/env.utils";
import { getHeaders } from "~/utils/fetch.utils";
import type { INetworkResponse } from "~/utils/types";

export interface IArbeidssokerSvar {
  registrertArbeidssoker: boolean;
}

export async function lagreArbeidssokerSvar(
  request: Request,
  rapporteringsperiodeId: string,
  svar: IArbeidssokerSvar
): Promise<INetworkResponse> {
  const url = `${getEnv(
    "DP_RAPPORTERING_URL"
  )}/rapporteringsperiode/${rapporteringsperiodeId}/arbeidssoker`;

  const response = await fetch(url, {
    method: "POST",
    headers: await getHeaders(request),
    body: JSON.stringify({ ...svar }),
  });

  if (!response.ok) {
    return {
      status: "error",
      error: {
        statusCode: response.status,
        statusText: `rapportering-feilmelding-lagre-arbeidssoker-svar`,
      },
    };
  }

  return { status: "success" };
}
