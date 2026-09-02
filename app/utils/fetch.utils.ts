import { uuidv7 } from "uuidv7";

import { getSessionId } from "~/../mocks/session";

import { getRapporteringOboToken } from "./auth.utils.server";
import { isLocalOrDemo } from "./env.utils";
import { logger } from "~/models/logger.server";

export function getCorralationId(headers: Headers) {
  return headers.get("X-Request-ID") ?? "";
}

function generateCorralationId() {
  // https://github.com/navikt/dp-rapportering-frontend/pull/242#pullrequestreview-2403834306
  // korralasjon_id i dp-rappoortering kan være på maks 54 tegn
  return `dp-rapp-${uuidv7()}`.substring(0, 54);
}

export async function getHeaders(request: Request, customHeaders = {}) {
  let onBehalfOfToken = "";

  try {
    onBehalfOfToken = await getRapporteringOboToken(request);
  } catch(error) {
    logger.error("Feil ved henting av OBO-token", error);
  }

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
