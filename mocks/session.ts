import { faker } from "@faker-js/faker";
import { factory, nullable, primaryKey } from "@mswjs/data";
import { lagForstRapporteringsperiode } from "~/devTools/rapporteringsperiode";

export type Database = ReturnType<SessionRecord["createDatabase"]>;

type SessionMap = Map<string, Database>;

class SessionRecord {
  private sessions: SessionMap;

  constructor() {
    this.sessions = new Map();
  }

  public getDatabase(sessionId: string): ReturnType<SessionRecord["createDatabase"]> {
    if (!this.sessions.has(sessionId)) {
      const db = this.createDatabase();

      this.sessions.set(sessionId, db);
      db.rapporteringsperioder.create(lagForstRapporteringsperiode());
    }

    return this.sessions.get(sessionId)!;
  }

  private createDatabase() {
    return factory({
      rapporteringsperioder: {
        id: primaryKey(faker.datatype.uuid),
        periode: {
          fraOgMed: () => faker.date.recent().toISOString(),
          tilOgMed: () => faker.date.future().toISOString(),
        },
        dager: Array,
        status: faker.string.alpha,
        kanSendesFra: () => faker.date.recent().toISOString(),
        kanSendes: faker.datatype.boolean,
        kanKorrigeres: faker.datatype.boolean,
        registrertArbeidssoker: nullable(faker.datatype.boolean),
      },
    });
  }
}

export const sessionRecord = new SessionRecord();

export function getSessionId(request: Request) {
  const cookieString = request.headers.get("Cookie") || "";
  const cookies = cookieString.split(";").map((cookie) => cookie.trim());

  const sessionCookie = cookies.find((cookie) => cookie.startsWith("sessionId="));

  if (sessionCookie) {
    return sessionCookie.split("=")[1];
  }
  return null;
}

export function hasSession(request: Request) {
  return request.headers.get("Cookie")?.includes("sessionId");
}
