import { db } from "./db";
import { rapporteringsperioderResponse } from "./responses/rapporteringsperioderResponse";
import { HttpResponse, bypass, http } from "msw";
import { ArbeidssokerSvar } from "~/models/arbeidssoker.server";
import {
  IRapporteringsperiode,
  IRapporteringsperiodeDag,
} from "~/models/rapporteringsperiode.server";
import { getEnv } from "~/utils/env.utils";

export const handlers = [
  // Hent alle innsendte rapporteringsperioder
  http.get(`${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder/innsendte`, () => {
    return HttpResponse.json(db.findAllInnsendtePerioder());
  }),

  // Hent gjeldende rapporteringsperiode
  http.get(`${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperiode/gjeldende`, () => {
    const rapporteringsperioder = db.findAllRapporteringsperioder();

    if (rapporteringsperioder.length > 0) {
      return HttpResponse.json(rapporteringsperioder[0]);
    }

    return new HttpResponse(null, { status: 404 });
  }),

  // Send inn rapporteringsperiode
  http.post(`${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperiode`, async ({ request }) => {
    const periode = (await request.json()) as IRapporteringsperiode;

    db.updateRapporteringsperiode(periode.id, { status: "Innsendt" });

    return new HttpResponse(null, { status: 200 });
  }),

  // Hent spesifikk rapporteringsperiode
  http.get(
    `${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperiode/:rapporteringsperioderId`,
    ({ params }) => {
      const rapporteringsperioderId = params.rapporteringsperioderId as string;

      return HttpResponse.json(db.findRapporteringsperiodeById(rapporteringsperioderId));
    }
  ),

  // Start korrigering av rapporteringsperiode
  http.post(
    `${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder/:rapporteringsperioderId/korrigering`,
    () => {
      return HttpResponse.json(rapporteringsperioderResponse[1]);
    }
  ),

  // Lagre en aktivitet
  http.post(
    `${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperiode/:rapporteringsperioderId/aktivitet`,
    async ({ params, request }) => {
      const rapporteringsperioderId = params.rapporteringsperioderId as string;

      const dag: IRapporteringsperiodeDag = (await request.json()) as IRapporteringsperiodeDag;

      db.lagreAktivitet(rapporteringsperioderId, dag);

      return new HttpResponse(null, { status: 204 });
    }
  ),

  // Slett en aktivitet
  http.delete(
    `${getEnv(
      "DP_RAPPORTERING_URL"
    )}/rapporteringsperiode/:rapporteringsperioderId/aktivitet/:aktivitetId`,
    () => {
      return new HttpResponse(null, { status: 204 });
    }
  ),

  // Lagre en arbeidssøker svar
  http.post(
    `${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperiode/:rapporteringsperioderId/arbeidssoker`,
    async ({ params, request }) => {
      const rapporteringsperioderId = params.rapporteringsperioderId as string;
      const { registrertArbeidssoker } = (await request.json()) as ArbeidssokerSvar;

      db.updateRapporteringsperiode(rapporteringsperioderId, { registrertArbeidssoker });
      return new HttpResponse(null, { status: 204 });
    }
  ),

  // Bypassing mocks, use actual data instead
  http.get("https://rt6o382n.apicdn.sanity.io/*", async ({ request }) => {
    const bypassResponse = await fetch(bypass(request));
    const response = await bypassResponse.json();

    return HttpResponse.json(response);
  }),
];
