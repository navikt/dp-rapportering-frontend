import { expiresIn, getToken, validateToken } from "@navikt/oasis";
import { getEnv, isLocalOrDemo, isLocalhost } from "~/utils/env.utils";
import { INetworkResponse } from "~/utils/types";

export interface ISessionData {
  expiresIn: number;
}

export async function getSession(req: Request): Promise<INetworkResponse<ISessionData>> {
  if (isLocalOrDemo) {
    return {
      status: "success",
      data: {
        expiresIn: 18000,
      },
    };
  }

  if (isLocalhost && getEnv("DP_RAPPORTERING_TOKEN")) {
    return {
      status: "success",
      data: {
        expiresIn: expiresIn(getEnv("DP_RAPPORTERING_TOKEN")),
      },
    };
  }

  const token = getToken(req);

  if (!token) {
    return {
      status: "error",
      error: {
        statusCode: 401,
        statusText: "rapportering-feilmelding-token-ikke-funnet",
      },
    };
  }

  const validation = await validateToken(token);
  if (!validation.ok) {
    return {
      status: "error",
      error: {
        statusCode: 401,
        statusText: "rapportering-feilmelding-ugyldig-token",
      },
    };
  }

  return {
    status: "success",
    data: {
      expiresIn: expiresIn(token),
    },
  };
}
