import { getRapporteringOboToken } from "./auth.utils.server";
import { isLocalOrDemo } from "./env.utils";
import { uuidv7 } from "uuidv7";
import { getSessionId } from "~/../mocks/session";
import { IHttpProblem } from "~/utils/types";

export function getCorralationId(headers: Headers) {
  return headers.get("X-Request-ID") ?? "";
}

function generateCorralationId() {
  // https://github.com/navikt/dp-rapportering-frontend/pull/242#pullrequestreview-2403834306
  // korralasjon_id i dp-rappoortering kan være på maks 54 tegn
  return `dp-rapp-${uuidv7()}`.substring(0, 54);
}

export async function getHeaders(request: Request, customHeaders = {}) {
  const onBehalfOfToken = await getRapporteringOboToken(request);

  const corralationId = request.headers.get("X-Request-ID") ?? generateCorralationId();

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${onBehalfOfToken}`,
    "X-Request-ID": corralationId,
    ...customHeaders,
  };

  if (isLocalOrDemo) {
    return { ...headers, Cookie: `sessionId=${getSessionId(request)}` };
  }

  return headers;
}

export async function getCorrelationId(errorResponse: Response) {
  try {
    const errorBody: IHttpProblem = await errorResponse.json();
    if (errorBody && errorBody.correlationId) {
      return errorBody.correlationId;
    }
  } catch {
    return "";
  }
}
