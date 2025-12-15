import { Collection } from "@msw/data";
import { z } from "zod";

import { lagForstRapporteringsperiode } from "~/devTools/rapporteringsperiode";

export type Database = ReturnType<SessionRecord["createDatabase"]>;

type SessionMap = Map<string, Database>;

class SessionRecord {
  private sessions: SessionMap;

  constructor() {
    this.sessions = new Map();
  }

  public async getDatabase(
    sessionId: string,
  ): Promise<ReturnType<SessionRecord["createDatabase"]>> {
    if (!this.sessions.has(sessionId)) {
      const db = this.createDatabase();

      this.sessions.set(sessionId, db);
      await db.rapporteringsperioder.create(lagForstRapporteringsperiode());
    }

    return this.sessions.get(sessionId)!;
  }

  private createDatabase() {
    return {
      rapporteringsperioder: new Collection({
        schema: z.object({
          id: z.uuid(),
          type: z.string(),
          periode: z.object({
            fraOgMed: z.string(),
            tilOgMed: z.string(),
          }),
          dager: z.array(
            z.object({
              dagIndex: z.number(),
              dato: z.string(),
              aktiviteter: z.array(
                z.object({
                  id: z.string().optional(),
                  type: z.string(),
                  timer: z.string().nullable().optional(),
                }),
              ),
            }),
          ),
          sisteFristForTrekk: z.string().nullable(),
          kanSendesFra: z.string(),
          kanSendes: z.boolean(),
          kanEndres: z.boolean(),
          bruttoBelop: z.number().nullable(),
          begrunnelseEndring: z.string().nullable(),
          status: z.enum(["TilUtfylling", "Innsendt", "Endret", "Ferdig", "Feilet"]),
          mottattDato: z.string().nullable(),
          registrertArbeidssoker: z.boolean().nullable(),
          originalId: z.string().nullable(),
          html: z.string().nullable(),
          rapporteringstype: z.enum(["harAktivitet", "harIngenAktivitet"]).nullable(),
        }),
      }),
    };
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
  const sessionId = getSessionId(request);
  return sessionId !== null;
}
