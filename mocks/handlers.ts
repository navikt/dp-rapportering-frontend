import { http, HttpResponse, passthrough } from "msw";

import { hentEndringsId, startEndring } from "~/devTools/rapporteringsperiode";
import { IArbeidssokerSvar } from "~/models/arbeidssoker.server";
import { IBegrunnelseSvar } from "~/models/begrunnelse.server";
import {
  IRapporteringsperiode,
  IRapporteringsperiodeDag,
} from "~/models/rapporteringsperiode.server";
import { IRapporteringstypeSvar } from "~/models/rapporteringstype.server";
import { formaterDato } from "~/utils/dato.utils";
import { DP_RAPPORTERING_URL } from "~/utils/env.utils";
import { IRapporteringsperiodeStatus } from "~/utils/types";

import { withDb } from "./responses/db";
import { getDatabase } from "./responses/db.utils";

export const createHandlers = (database?: ReturnType<typeof withDb>) => [
  http.get(`${DP_RAPPORTERING_URL}/hardpmeldeplikt`, () => {
    return HttpResponse.text("true");
  }),

  http.get(`${DP_RAPPORTERING_URL}/rapporteringsperioder`, async ({ cookies }) => {
    const db = database || (await getDatabase(cookies));
    const perioder = db.findAllRapporteringsperioder();

    if (perioder.length === 0) {
      return HttpResponse.json([], { status: 204 });
    }

    return HttpResponse.json(db.findAllRapporteringsperioder());
  }),

  http.get(`${DP_RAPPORTERING_URL}/rapporteringsperioder/innsendte`, async ({ cookies }) => {
    const db = database || (await getDatabase(cookies));
    return HttpResponse.json(db.findAllInnsendtePerioder());
  }),

  http.post(`${DP_RAPPORTERING_URL}/rapporteringsperiode`, async ({ cookies, request }) => {
    const db = database || (await getDatabase(cookies));
    const periode = (await request.json()) as IRapporteringsperiode;

    const mottattDato = formaterDato({ dato: new Date(), dateFormat: "yyyy-MM-dd" });

    if (periode.originalId) {
      await db.updateRapporteringsperiode(periode.originalId, {
        kanEndres: false,
        status: IRapporteringsperiodeStatus.Endret,
      });

      const endretPeriode = hentEndringsId(periode);

      await db.addRapporteringsperioder({
        ...endretPeriode,
        status: IRapporteringsperiodeStatus.Innsendt,
        kanEndres: false,
        kanSendes: false,
        mottattDato,
      });

      db.deleteRapporteringsperiode(periode.id);
      return HttpResponse.json({ id: endretPeriode.id });
    }

    await db.updateRapporteringsperiode(periode.id, {
      status: IRapporteringsperiodeStatus.Innsendt,
      kanSendes: false,
      mottattDato,
      registrertArbeidssoker: periode.registrertArbeidssoker ?? true,
    });

    return HttpResponse.json({ id: periode.id });
  }),

  http.get(
    `${DP_RAPPORTERING_URL}/rapporteringsperiode/:rapporteringsperiodeId`,
    async ({ cookies, params }) => {
      const db = database || (await getDatabase(cookies));
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
    async ({ cookies, params }) => {
      const db = database || (await getDatabase(cookies));

      const rapporteringsperiodeId = params.rapporteringsperiodeId as string;

      const rapporteringsperiode = db.findRapporteringsperiodeById(rapporteringsperiodeId);

      const endretPeriode = startEndring(rapporteringsperiode);

      await db.addRapporteringsperioder(endretPeriode);

      return HttpResponse.json({ id: endretPeriode.id });
    },
  ),

  http.post(
    `${DP_RAPPORTERING_URL}/rapporteringsperiode/:rapporteringsperiodeId/aktivitet`,
    async ({ cookies, request, params }) => {
      const db = database || (await getDatabase(cookies));

      const rapporteringsperiodeId = params.rapporteringsperiodeId as string;
      const dag = (await request.json()) as IRapporteringsperiodeDag;

      await db.lagreAktivitet(rapporteringsperiodeId, dag);

      return HttpResponse.json(undefined, { status: 204 });
    },
  ),

  http.delete(
    `${DP_RAPPORTERING_URL}/rapporteringsperiode/:rapporteringsperiodeId/aktiviteter`,

    async ({ cookies, params }) => {
      const db = database || (await getDatabase(cookies));

      const rapporteringsperiodeId = params.rapporteringsperiodeId as string;

      await db.deleteAllAktiviteter(rapporteringsperiodeId);

      return HttpResponse.json(undefined, { status: 204 });
    },
  ),

  http.post(
    `${DP_RAPPORTERING_URL}/rapporteringsperiode/:rapporteringsperiodeId/arbeidssoker`,
    async ({ cookies, params, request }) => {
      const db = database || (await getDatabase(cookies));
      const rapporteringsperiodeId = params.rapporteringsperiodeId as string;
      const { registrertArbeidssoker } = (await request.json()) as IArbeidssokerSvar;

      await db.updateRapporteringsperiode(rapporteringsperiodeId, { registrertArbeidssoker });

      return HttpResponse.json(undefined, { status: 204 });
    },
  ),

  http.post(
    `${DP_RAPPORTERING_URL}/rapporteringsperiode/:rapporteringsperiodeId/begrunnelse`,
    async ({ cookies, params, request }) => {
      const db = database || (await getDatabase(cookies));

      const rapporteringsperiodeId = params.rapporteringsperiodeId as string;
      const { begrunnelseEndring } = (await request.json()) as IBegrunnelseSvar;

      await db.updateRapporteringsperiode(rapporteringsperiodeId, { begrunnelseEndring });

      return HttpResponse.json(undefined, { status: 204 });
    },
  ),

  http.post(
    `${DP_RAPPORTERING_URL}/rapporteringsperiode/:rapporteringsperiodeId/rapporteringstype`,
    async ({ cookies, params, request }) => {
      const db = database || (await getDatabase(cookies));
      const rapporteringsperiodeId = params.rapporteringsperiodeId as string;
      const { rapporteringstype } = (await request.json()) as IRapporteringstypeSvar;

      await db.updateRapporteringsperiode(rapporteringsperiodeId, { rapporteringstype });

      return HttpResponse.json(undefined, { status: 204 });
    },
  ),

  http.get("https://rt6o382n.apicdn.sanity.io/*", async () => {
    return passthrough();
  }),
];
