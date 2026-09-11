import { uuidv7 } from "uuidv7";

import { getSessionId } from "~/../mocks/session";
import { IHttpProblem } from "~/utils/types";

import { getRapporteringOboToken } from "./auth.utils.server";
import { isLocalOrDemo } from "./env.utils";

export function getCorrelationId(
  headers: Headers,
  body: IHttpProblem | null = null,
): string | undefined {
  return (
    body?.correlationId ??
    headers.get("x-request-id") ??
    headers.get("x_correlation-id") ??
    undefined
  );
}

function generateCorralationId() {
  // https://github.com/navikt/dp-rapportering-frontend/pull/242#pullrequestreview-2403834306
  // korralasjon_id i dp-rappoortering kan være på maks 54 tegn
  return `dp-rapp-${uuidv7()}`.substring(0, 54);
}

export async function getHeaders(request: Request, customHeaders = {}) {
  const onBehalfOfToken = await getRapporteringOboToken(request);

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${onBehalfOfToken}`,
    "X-Request-ID": generateCorralationId(),
    connection: "keep-alive",
    Referer: request.url,
    ...customHeaders,
  };

  if (isLocalOrDemo) {
    return { ...headers, Cookie: `sessionId=${getSessionId(request)}` };
  }

  return headers;
}
