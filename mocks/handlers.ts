import { withDb } from "./responses/db";
import { sessionRecord } from "./session";
import { HttpResponse, JsonBodyType, PathParams, bypass, http } from "msw";
import { lagKorrigeringsperiode } from "~/devTools/rapporteringsperiode";
import { ArbeidssokerSvar } from "~/models/arbeidssoker.server";
import {
  IRapporteringsperiode,
  IRapporteringsperiodeDag,
} from "~/models/rapporteringsperiode.server";
import { getEnv } from "~/utils/env.utils";

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

const withDbHandler =
  <T extends JsonBodyType>(callback: (args: CallbackArgs) => T) =>
  ({ cookies, request, params }: RequestHandler) => {
    const sessionId = cookies["sessionId"];
    if (sessionId) {
      const db = withDb(sessionRecord.getDatabase(sessionId));
      return callback({ db, request, params });
    }
    return HttpResponse.json([]);
  };

const path = (endpoint: string) => `${getEnv("DP_RAPPORTERING_URL")}${endpoint}`;

export const handlers = [
  http.get(
    path("/rapporteringsperioder"),
    withDbHandler(({ db }) => HttpResponse.json(db.findAllRapporteringsperioder()))
  ),

  http.get(
    path("/rapporteringsperioder/innsendte"),
    withDbHandler(({ db }) => HttpResponse.json(db.findAllInnsendtePerioder()))
  ),

  http.post(
    path("/rapporteringsperiode"),
    withDbHandler(async ({ db, request }) => {
      const periode = (await request.json()) as IRapporteringsperiode;
      db.updateRapporteringsperiode(periode.id, { status: "Innsendt" });

      return HttpResponse.json(null, { status: 500 });
    })
  ),

  http.get(
    path("/rapporteringsperiode/:rapporteringsperioderId"),
    withDbHandler(({ db, params }) => {
      const rapporteringsperioderId = params.rapporteringsperioderId as string;

      return HttpResponse.json(db.findRapporteringsperiodeById(rapporteringsperioderId));
    })
  ),

  http.post(path("/rapporteringsperiode/:rapporteringsperioderId/start"), () => {
    return HttpResponse.json(null, { status: 200 });
  }),

  http.post(
    path("/rapporteringsperiode/:rapporteringsperioderId/korriger"),
    withDbHandler(({ db, params }) => {
      const rapporteringsperioderId = params.rapporteringsperioderId as string;

      const rapporteringsperiode = db.findRapporteringsperiodeById(rapporteringsperioderId);

      const korrigertPeriode = lagKorrigeringsperiode(rapporteringsperiode);

      db.deleteRapporteringsperiode(rapporteringsperioderId);
      db.addRapporteringsperioder(korrigertPeriode);

      return HttpResponse.json(korrigertPeriode, { status: 200 });
    })
  ),

  http.post(
    path("/rapporteringsperiode/:rapporteringsperioderId/aktivitet"),
    withDbHandler(async ({ db, params, request }) => {
      const rapporteringsperioderId = params.rapporteringsperioderId as string;
      const dag = (await request.json()) as IRapporteringsperiodeDag;

      db.lagreAktivitet(rapporteringsperioderId, dag);

      return HttpResponse.json(null, { status: 204 });
    })
  ),

  http.post(
    path("/rapporteringsperiode/:rapporteringsperioderId/arbeidssoker"),
    withDbHandler(async ({ db, params, request }) => {
      const rapporteringsperioderId = params.rapporteringsperioderId as string;
      const { registrertArbeidssoker } = (await request.json()) as ArbeidssokerSvar;

      db.updateRapporteringsperiode(rapporteringsperioderId, { registrertArbeidssoker });

      return HttpResponse.json(null, { status: 204 });
    })
  ),

  http.get("https://rt6o382n.apicdn.sanity.io/*", async ({ request }) => {
    const bypassResponse = await fetch(bypass(request));
    const response = await bypassResponse.json();

    return HttpResponse.json(response);
  }),
];
