import { expiresIn, getToken, validateToken } from "@navikt/oasis";
import { INetworkResponse } from "~/models/networkResponse";
import { getEnv } from "~/utils/env.utils";

export interface ISessionData {
  expiresIn: number;
}

export async function getSession(req: Request): Promise<INetworkResponse<ISessionData>> {
  if (getEnv("USE_MSW") === "true") {
    return {
      status: "success",
      data: {
        expiresIn: 18000,
      },
    };
  }

  if (getEnv("IS_LOCALHOST") === "true" && getEnv("DP_RAPPORTERING_TOKEN")) {
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
        statusText: "Token not found",
      },
    };
  }

  const validation = await validateToken(token);
  if (!validation.ok) {
    return {
      status: "error",
      error: {
        statusCode: 401,
        statusText: "Invalid token",
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
