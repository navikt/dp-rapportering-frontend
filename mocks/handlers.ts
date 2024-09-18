import { withDb } from "./responses/db";
import { sessionRecord } from "./session";
import { HttpResponse, JsonBodyType, PathParams, bypass, http } from "msw";
import { hentEndringsId, startEndring } from "~/devTools/rapporteringsperiode";
import { IArbeidssokerSvar } from "~/models/arbeidssoker.server";
import { IBegrunnelseSvar } from "~/models/begrunnelse.server";
import {
  IRapporteringsperiode,
  IRapporteringsperiodeDag,
  IRapporteringsperiodeStatus,
} from "~/models/rapporteringsperiode.server";
import { IRapporteringstypeSvar } from "~/models/rapporteringstype.server";
import { DP_RAPPORTERING_URL } from "~/utils/env.utils";

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

export const handlers = [
  http.get(
    `${DP_RAPPORTERING_URL}/rapporteringsperioder`,
    withDbHandler(({ db }) => HttpResponse.json(db.findAllRapporteringsperioder()))
  ),

  http.get(
    `${DP_RAPPORTERING_URL}/rapporteringsperioder/innsendte`,
    withDbHandler(({ db }) => HttpResponse.json(db.findAllInnsendtePerioder()))
  ),

  http.post(
    `${DP_RAPPORTERING_URL}/rapporteringsperiode`,
    withDbHandler(async ({ db, request }) => {
      const periode = (await request.json()) as IRapporteringsperiode;

      if (periode.status === IRapporteringsperiodeStatus.Endret) {
        const originalPeriode = db.findRapporteringsperiodeById(periode.originalId as string);
        db.updateRapporteringsperiode(originalPeriode.id, { kanEndres: false });

        const endretPeriode = hentEndringsId(periode);
        db.addRapporteringsperioder({
          ...endretPeriode,
          status: IRapporteringsperiodeStatus.Innsendt,
        });
        return HttpResponse.json({ id: endretPeriode.id }, { status: 200 });
      }

      db.updateRapporteringsperiode(periode.id, { status: IRapporteringsperiodeStatus.Innsendt });

      return HttpResponse.json({ id: periode.id }, { status: 200 });
    })
  ),

  http.get(
    `${DP_RAPPORTERING_URL}/rapporteringsperiode/:rapporteringsperioderId`,
    withDbHandler(({ db, params }) => {
      const rapporteringsperioderId = params.rapporteringsperioderId as string;

      return HttpResponse.json(db.findRapporteringsperiodeById(rapporteringsperioderId));
    })
  ),

  http.post(`${DP_RAPPORTERING_URL}/rapporteringsperiode/:rapporteringsperioderId/start`, () => {
    return HttpResponse.json(null, { status: 200 });
  }),

  http.post(
    `${DP_RAPPORTERING_URL}/rapporteringsperiode/:rapporteringsperioderId/endre`,
    withDbHandler(({ db, params }) => {
      const rapporteringsperioderId = params.rapporteringsperioderId as string;

      const rapporteringsperiode = db.findRapporteringsperiodeById(rapporteringsperioderId);

      const endretPeriode = startEndring(rapporteringsperiode);

      db.addRapporteringsperioder(endretPeriode);

      return HttpResponse.json({ id: endretPeriode.id }, { status: 200 });
    })
  ),

  http.post(
    `${DP_RAPPORTERING_URL}/rapporteringsperiode/:rapporteringsperioderId/aktivitet`,
    withDbHandler(async ({ db, params, request }) => {
      const rapporteringsperioderId = params.rapporteringsperioderId as string;
      const dag = (await request.json()) as IRapporteringsperiodeDag;

      db.lagreAktivitet(rapporteringsperioderId, dag);

      return HttpResponse.json(null, { status: 204 });
    })
  ),

  http.post(
    `${DP_RAPPORTERING_URL}/rapporteringsperiode/:rapporteringsperioderId/arbeidssoker`,
    withDbHandler(async ({ db, params, request }) => {
      const rapporteringsperioderId = params.rapporteringsperioderId as string;
      const { registrertArbeidssoker } = (await request.json()) as IArbeidssokerSvar;

      db.updateRapporteringsperiode(rapporteringsperioderId, { registrertArbeidssoker });

      return HttpResponse.json(null, { status: 204 });
    })
  ),

  http.post(
    `${DP_RAPPORTERING_URL}/rapporteringsperiode/:rapporteringsperioderId/begrunnelse`,
    withDbHandler(async ({ db, params, request }) => {
      const rapporteringsperioderId = params.rapporteringsperioderId as string;
      const { begrunnelseEndring } = (await request.json()) as IBegrunnelseSvar;

      db.updateRapporteringsperiode(rapporteringsperioderId, { begrunnelseEndring });

      return HttpResponse.json(null, { status: 204 });
    })
  ),

  http.post(
    `${DP_RAPPORTERING_URL}/rapporteringsperiode/:rapporteringsperioderId/rapporteringstype`,
    withDbHandler(async ({ db, params, request }) => {
      const rapporteringsperioderId = params.rapporteringsperioderId as string;
      const { rapporteringstype } = (await request.json()) as IRapporteringstypeSvar;

      db.updateRapporteringsperiode(rapporteringsperioderId, { rapporteringstype });

      return HttpResponse.json(null, { status: 204 });
    })
  ),

  http.get("https://rt6o382n.apicdn.sanity.io/*", async ({ request }) => {
    const bypassResponse = await fetch(bypass(request));
    const response = await bypassResponse.json();

    return HttpResponse.json(response);
  }),
];
