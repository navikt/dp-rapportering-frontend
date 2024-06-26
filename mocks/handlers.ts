import { rapporteringsperioderResponse } from "./responses/rapporteringsperioderResponse";
import { withDb } from "./responses/withDb";
import { sessionRecord } from "./session";
import { HttpResponse, JsonBodyType, PathParams, bypass, http } from "msw";
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

  http.get(
    path("/rapporteringsperiode/gjeldende"),
    withDbHandler(({ db }) => {
      const rapporteringsperioder = db.findAllRapporteringsperioder();
      const response = rapporteringsperioder.length > 0 ? rapporteringsperioder[0] : null;

      if (response) {
        return HttpResponse.json(response, { status: 200 });
      } else {
        return HttpResponse.json(null, { status: 404 });
      }
    })
  ),

  http.post(
    path("/rapporteringsperiode"),
    withDbHandler(async ({ db, request }) => {
      const periode = (await request.json()) as IRapporteringsperiode;
      db.updateRapporteringsperiode(periode.id, { status: "Innsendt" });

      return HttpResponse.json(null, { status: 200 });
    })
  ),

  http.get(
    path("/rapporteringsperiode/:rapporteringsperioderId"),
    withDbHandler(({ db, params }) => {
      const rapporteringsperioderId = params.rapporteringsperioderId as string;

      return HttpResponse.json(db.findRapporteringsperiodeById(rapporteringsperioderId));
    })
  ),

  http.post(path("/rapporteringsperioder/:rapporteringsperioderId/korrigering"), () => {
    return HttpResponse.json(rapporteringsperioderResponse[1]);
  }),

  http.post(
    path("/rapporteringsperiode/:rapporteringsperioderId/aktivitet"),
    withDbHandler(async ({ db, params, request }) => {
      const rapporteringsperioderId = params.rapporteringsperioderId as string;
      const dag = (await request.json()) as IRapporteringsperiodeDag;

      db.lagreAktivitet(rapporteringsperioderId, dag);

      return HttpResponse.json(null, { status: 204 });
    })
  ),

  http.delete(path("/rapporteringsperiode/:rapporteringsperioderId/aktivitet/:aktivitetId"), () => {
    HttpResponse.json(null, { status: 204 });
  }),

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
