import { getRapporteringOboToken } from "./auth.utils.server";
import { isLocalOrDemo } from "./env.utils";
import { getSessionId } from "~/../mocks/session";

export async function getHeaders(request: Request, customHeaders = {}) {
  const onBehalfOfToken = await getRapporteringOboToken(request);

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${onBehalfOfToken}`,
    ...customHeaders,
  };

  if (isLocalOrDemo) {
    return { ...headers, Cookie: `sessionId=${getSessionId(request)}` };
  }

  return headers;
}
