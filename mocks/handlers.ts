import { withDb } from "./responses/db";
import { getDatabase } from "./responses/db.utils";
import { HttpResponse, bypass, http } from "msw";
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

export const createHandlers = (database?: ReturnType<typeof withDb>) => [
  http.get(`${DP_RAPPORTERING_URL}/rapporteringsperioder`, ({ cookies }) => {
    const db = database || getDatabase(cookies);
    return HttpResponse.json(db.findAllRapporteringsperioder());
  }),

  http.get(`${DP_RAPPORTERING_URL}/rapporteringsperioder/innsendte`, ({ cookies }) => {
    const db = database || getDatabase(cookies);
    return HttpResponse.json(db.findAllInnsendtePerioder());
  }),

  http.post(`${DP_RAPPORTERING_URL}/rapporteringsperiode`, async ({ cookies, request }) => {
    const db = database || getDatabase(cookies);
    const periode = (await request.json()) as IRapporteringsperiode;

    if (periode.originalId) {
      const originalPeriode = db.findRapporteringsperiodeById(periode.originalId as string);
      db.updateRapporteringsperiode(originalPeriode.id, { kanEndres: false });

      const endretPeriode = hentEndringsId(periode);
      db.addRapporteringsperioder({
        ...endretPeriode,
        status: IRapporteringsperiodeStatus.Innsendt,
        kanEndres: false,
        kanSendes: false,
      });
      return HttpResponse.json({ id: endretPeriode.id }, { status: 200 });
    }
  }),

  http.get(
    `${DP_RAPPORTERING_URL}/rapporteringsperiode/:rapporteringsperioderId`,
    ({ cookies, params }) => {
      const db = database || getDatabase(cookies);
      const rapporteringsperioderId = params.rapporteringsperioderId as string;

      return HttpResponse.json(db.findRapporteringsperiodeById(rapporteringsperioderId));
    }
  ),

  http.post(`${DP_RAPPORTERING_URL}/rapporteringsperiode/:rapporteringsperioderId/start`, () => {
    return HttpResponse.json(null, { status: 200 });
  }),

  http.post(
    `${DP_RAPPORTERING_URL}/rapporteringsperiode/:rapporteringsperioderId/endre`,
    ({ cookies, params }) => {
      const db = database || getDatabase(cookies);

      const rapporteringsperioderId = params.rapporteringsperioderId as string;

      const rapporteringsperiode = db.findRapporteringsperiodeById(rapporteringsperioderId);

      const endretPeriode = startEndring(rapporteringsperiode);

      db.addRapporteringsperioder(endretPeriode);

      return HttpResponse.json({ id: endretPeriode.id }, { status: 200 });
    }
  ),

  http.post(
    `${DP_RAPPORTERING_URL}/rapporteringsperiode/:rapporteringsperioderId/aktivitet`,
    async ({ cookies, request, params }) => {
      console.log(`🔥: lagrer :`);
      const db = database || getDatabase(cookies);

      const rapporteringsperioderId = params.rapporteringsperioderId as string;
      const dag = (await request.json()) as IRapporteringsperiodeDag;

      console.log(`🔥: dag :`, dag);

      db.lagreAktivitet(rapporteringsperioderId, dag);

      return HttpResponse.json(null, { status: 204 });
    }
  ),

  http.post(
    `${DP_RAPPORTERING_URL}/rapporteringsperiode/:rapporteringsperioderId/arbeidssoker`,
    async ({ cookies, params, request }) => {
      const db = database || getDatabase(cookies);
      const rapporteringsperioderId = params.rapporteringsperioderId as string;
      const { registrertArbeidssoker } = (await request.json()) as IArbeidssokerSvar;

      db.updateRapporteringsperiode(rapporteringsperioderId, { registrertArbeidssoker });

      return HttpResponse.json(null, { status: 204 });
    }
  ),

  http.post(
    `${DP_RAPPORTERING_URL}/rapporteringsperiode/:rapporteringsperioderId/begrunnelse`,
    async ({ cookies, params, request }) => {
      const db = database || getDatabase(cookies);

      const rapporteringsperioderId = params.rapporteringsperioderId as string;
      const { begrunnelseEndring } = (await request.json()) as IBegrunnelseSvar;

      db.updateRapporteringsperiode(rapporteringsperioderId, { begrunnelseEndring });

      return HttpResponse.json(null, { status: 204 });
    }
  ),

  http.post(
    `${DP_RAPPORTERING_URL}/rapporteringsperiode/:rapporteringsperioderId/rapporteringstype`,
    async ({ cookies, params, request }) => {
      const db = database || getDatabase(cookies);
      const rapporteringsperioderId = params.rapporteringsperioderId as string;
      const { rapporteringstype } = (await request.json()) as IRapporteringstypeSvar;

      db.updateRapporteringsperiode(rapporteringsperioderId, { rapporteringstype });

      return HttpResponse.json(null, { status: 204 });
    }
  ),

  http.get("https://rt6o382n.apicdn.sanity.io/*", async ({ request }) => {
    const bypassResponse = await fetch(bypass(request));
    const response = await bypassResponse.json();

    return HttpResponse.json(response);
  }),
];
