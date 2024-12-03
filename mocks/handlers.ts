import { http, HttpResponse, passthrough } from "msw";

import { formatereDato } from "~/devTools/periodedato";
import { hentEndringsId, startEndring } from "~/devTools/rapporteringsperiode";
import { IArbeidssokerSvar } from "~/models/arbeidssoker.server";
import { IBegrunnelseSvar } from "~/models/begrunnelse.server";
import {
  IRapporteringsperiode,
  IRapporteringsperiodeDag,
} from "~/models/rapporteringsperiode.server";
import { IRapporteringstypeSvar } from "~/models/rapporteringstype.server";
import { DP_RAPPORTERING_URL } from "~/utils/env.utils";
import { IRapporteringsperiodeStatus } from "~/utils/types";

import { withDb } from "./responses/db";
import { getDatabase } from "./responses/db.utils";

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

    const mottattDato = formatereDato(new Date());

    if (periode.originalId) {
      db.updateRapporteringsperiode(periode.originalId, {
        kanEndres: false,
        status: IRapporteringsperiodeStatus.Endret,
      });

      const endretPeriode = hentEndringsId(periode);

      db.addRapporteringsperioder({
        ...endretPeriode,
        status: IRapporteringsperiodeStatus.Innsendt,
        kanEndres: false,
        kanSendes: false,
        mottattDato,
      });

      db.deleteRapporteringsperiode(periode.id);
      return HttpResponse.json({ id: endretPeriode.id });
    }

    db.updateRapporteringsperiode(periode.id, {
      status: IRapporteringsperiodeStatus.Innsendt,
      kanSendes: false,
      mottattDato,
    });

    return HttpResponse.json({ id: periode.id });
  }),

  http.get(
    `${DP_RAPPORTERING_URL}/rapporteringsperiode/:rapporteringsperiodeId`,
    ({ cookies, params }) => {
      const db = database || getDatabase(cookies);
      const rapporteringsperiodeId = params.rapporteringsperiodeId as string;
      const periode = db.findRapporteringsperiodeById(rapporteringsperiodeId);

      if (!periode) {
        return HttpResponse.json(null, { status: 404 });
      }

      return HttpResponse.json(periode);
    },
  ),

  http.post(`${DP_RAPPORTERING_URL}/rapporteringsperiode/:rapporteringsperiodeId/start`, () => {
    return HttpResponse.json(undefined, { status: 204 });
  }),

  http.post(
    `${DP_RAPPORTERING_URL}/rapporteringsperiode/:rapporteringsperiodeId/endre`,
    ({ cookies, params }) => {
      const db = database || getDatabase(cookies);

      const rapporteringsperiodeId = params.rapporteringsperiodeId as string;

      const rapporteringsperiode = db.findRapporteringsperiodeById(rapporteringsperiodeId);

      const endretPeriode = startEndring(rapporteringsperiode);

      db.addRapporteringsperioder(endretPeriode);

      return HttpResponse.json({ id: endretPeriode.id });
    },
  ),

  http.post(
    `${DP_RAPPORTERING_URL}/rapporteringsperiode/:rapporteringsperiodeId/aktivitet`,
    async ({ cookies, request, params }) => {
      const db = database || getDatabase(cookies);

      const rapporteringsperiodeId = params.rapporteringsperiodeId as string;
      const dag = (await request.json()) as IRapporteringsperiodeDag;

      db.lagreAktivitet(rapporteringsperiodeId, dag);

      return HttpResponse.json(undefined, { status: 204 });
    },
  ),

  http.post(
    `${DP_RAPPORTERING_URL}/rapporteringsperiode/:rapporteringsperiodeId/arbeidssoker`,
    async ({ cookies, params, request }) => {
      const db = database || getDatabase(cookies);
      const rapporteringsperiodeId = params.rapporteringsperiodeId as string;
      const { registrertArbeidssoker } = (await request.json()) as IArbeidssokerSvar;

      db.updateRapporteringsperiode(rapporteringsperiodeId, { registrertArbeidssoker });

      return HttpResponse.json(undefined, { status: 204 });
    },
  ),

  http.post(
    `${DP_RAPPORTERING_URL}/rapporteringsperiode/:rapporteringsperiodeId/begrunnelse`,
    async ({ cookies, params, request }) => {
      const db = database || getDatabase(cookies);

      const rapporteringsperiodeId = params.rapporteringsperiodeId as string;
      const { begrunnelseEndring } = (await request.json()) as IBegrunnelseSvar;

      db.updateRapporteringsperiode(rapporteringsperiodeId, { begrunnelseEndring });

      return HttpResponse.json(undefined, { status: 204 });
    },
  ),

  http.post(
    `${DP_RAPPORTERING_URL}/rapporteringsperiode/:rapporteringsperiodeId/rapporteringstype`,
    async ({ cookies, params, request }) => {
      const db = database || getDatabase(cookies);
      const rapporteringsperiodeId = params.rapporteringsperiodeId as string;
      const { rapporteringstype } = (await request.json()) as IRapporteringstypeSvar;

      db.updateRapporteringsperiode(rapporteringsperiodeId, { rapporteringstype });

      return HttpResponse.json(undefined, { status: 204 });
    },
  ),

  http.get("https://rt6o382n.apicdn.sanity.io/*", async () => {
    return passthrough();
  }),
];
