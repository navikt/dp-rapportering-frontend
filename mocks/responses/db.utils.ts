import { HttpResponse, JsonBodyType, PathParams } from "msw";

import { sessionRecord } from "../../mocks/session";
import { withDb } from "./db";

interface RequestHandler {
  request: Request;
  params: PathParams;
  cookies: Record<string, string>;
}

type CallbackArgs = {
  db: ReturnType<typeof withDb>;
  request: Request;
  params: PathParams;
};

export const withDbHandler =
  <T extends JsonBodyType>(callback: (args: CallbackArgs) => T, db?: ReturnType<typeof withDb>) =>
  ({ cookies, request, params }: RequestHandler) => {
    const sessionId = cookies["sessionId"];

    if (db) {
      return callback({ db, request, params });
    }

    const defaultDb = sessionId ? withDb(sessionRecord.getDatabase(sessionId)) : null;

    if (defaultDb) {
      return callback({ db: defaultDb, request, params });
    }

    return HttpResponse.json([]);
  };

export function getDatabase(cookies: Record<string, string>) {
  const sessionId = cookies["sessionId"];

  return withDb(sessionRecord.getDatabase(sessionId));
}
