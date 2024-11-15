import { withDb } from "./responses/db";
import { getDatabase } from "./responses/db.utils";
import { HttpResponse, http, passthrough } from "msw";
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

export const createHandlers = (database?: ReturnType<typeof withDb>) => [
  http.get(`${DP_RAPPORTERING_URL}/rapporteringsperioder`, ({ cookies }) => {
    const db = database || getDatabase(cookies);
    return new HttpResponse(JSON.stringify(db.findAllRapporteringsperioder()), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }),

  http.get(`${DP_RAPPORTERING_URL}/rapporteringsperioder/innsendte`, ({ cookies }) => {
    const db = database || getDatabase(cookies);
    return new HttpResponse(JSON.stringify(db.findAllInnsendtePerioder()), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
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
      return new HttpResponse(JSON.stringify({ id: endretPeriode.id }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    db.updateRapporteringsperiode(periode.id, {
      status: IRapporteringsperiodeStatus.Innsendt,
      kanSendes: false,
      mottattDato,
    });

    return new HttpResponse(JSON.stringify({ id: periode.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }),

  http.get(
    `${DP_RAPPORTERING_URL}/rapporteringsperiode/:rapporteringsperiodeId`,
    ({ cookies, params }) => {
      const db = database || getDatabase(cookies);
      const rapporteringsperiodeId = params.rapporteringsperiodeId as string;
      const periode = db.findRapporteringsperiodeById(rapporteringsperiodeId);

      if (!periode) {
        return new HttpResponse(JSON.stringify(periode), {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        });
      }

      return new HttpResponse(JSON.stringify(periode), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  ),

  http.post(`${DP_RAPPORTERING_URL}/rapporteringsperiode/:rapporteringsperiodeId/start`, () => {
    return new HttpResponse(null, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }),

  http.post(
    `${DP_RAPPORTERING_URL}/rapporteringsperiode/:rapporteringsperiodeId/endre`,
    ({ cookies, params }) => {
      const db = database || getDatabase(cookies);

      const rapporteringsperiodeId = params.rapporteringsperiodeId as string;

      const rapporteringsperiode = db.findRapporteringsperiodeById(rapporteringsperiodeId);

      const endretPeriode = startEndring(rapporteringsperiode);

      db.addRapporteringsperioder(endretPeriode);

      return new HttpResponse(JSON.stringify({ id: endretPeriode.id }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  ),

  http.post(
    `${DP_RAPPORTERING_URL}/rapporteringsperiode/:rapporteringsperiodeId/aktivitet`,
    async ({ cookies, request, params }) => {
      const db = database || getDatabase(cookies);

      const rapporteringsperiodeId = params.rapporteringsperiodeId as string;
      const dag = (await request.json()) as IRapporteringsperiodeDag;

      db.lagreAktivitet(rapporteringsperiodeId, dag);

      return new HttpResponse(null, {
        status: 204,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  ),

  http.post(
    `${DP_RAPPORTERING_URL}/rapporteringsperiode/:rapporteringsperiodeId/arbeidssoker`,
    async ({ cookies, params, request }) => {
      const db = database || getDatabase(cookies);
      const rapporteringsperiodeId = params.rapporteringsperiodeId as string;
      const { registrertArbeidssoker } = (await request.json()) as IArbeidssokerSvar;

      db.updateRapporteringsperiode(rapporteringsperiodeId, { registrertArbeidssoker });

      return new HttpResponse(null, {
        status: 204,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  ),

  http.post(
    `${DP_RAPPORTERING_URL}/rapporteringsperiode/:rapporteringsperiodeId/begrunnelse`,
    async ({ cookies, params, request }) => {
      const db = database || getDatabase(cookies);

      const rapporteringsperiodeId = params.rapporteringsperiodeId as string;
      const { begrunnelseEndring } = (await request.json()) as IBegrunnelseSvar;

      db.updateRapporteringsperiode(rapporteringsperiodeId, { begrunnelseEndring });

      return new HttpResponse(null, {
        status: 204,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  ),

  http.post(
    `${DP_RAPPORTERING_URL}/rapporteringsperiode/:rapporteringsperiodeId/rapporteringstype`,
    async ({ cookies, params, request }) => {
      const db = database || getDatabase(cookies);
      const rapporteringsperiodeId = params.rapporteringsperiodeId as string;
      const { rapporteringstype } = (await request.json()) as IRapporteringstypeSvar;

      db.updateRapporteringsperiode(rapporteringsperiodeId, { rapporteringstype });

      return new HttpResponse(null, {
        status: 204,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  ),

  http.get("https://rt6o382n.apicdn.sanity.io/*", async () => {
    return passthrough();
  }),
];
