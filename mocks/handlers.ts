import {
  perioderMedAktiviteter,
  perioderMedArbeidSykFravaer,
  perioderMedKunArbeid,
  perioderUtenAktiviteter,
} from "./../app/devTools/data";
import { mockDb } from "./mockDb";
import { gjeldendePeriodeResponse } from "./responses/gjeldendePeriodeResponse";
import { rapporteringsperioderResponse } from "./responses/rapporteringsperioderResponse";
import { HttpResponse, bypass, http } from "msw";
import { ScenerioType } from "~/devTools";
import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { getEnv } from "~/utils/env.utils";

const hentInnsendtePerioder = (scenerio?: ScenerioType) => {
  const innsendtePerioder =
    mockDb.innsendteRapporteringsperioder.getAll() as IRapporteringsperiode[];

  switch (scenerio) {
    case ScenerioType.UtenAktiviteter:
      return innsendtePerioder.filter(perioderUtenAktiviteter);

    case ScenerioType.MedArbeidAktivitet:
      return innsendtePerioder.filter(perioderMedAktiviteter).filter(perioderMedKunArbeid);

    case ScenerioType.ArbeidSykFravaer:
      return innsendtePerioder
        .filter(perioderMedAktiviteter)
        .filter((periode) => !perioderMedKunArbeid(periode))
        .filter(perioderMedArbeidSykFravaer);

    default:
      return mockDb.innsendteRapporteringsperioder.getAll();
  }
};

export const handlers = [
  // Hent alle rapporteringsperioder
  http.get(`${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder`, () => {
    return HttpResponse.json(rapporteringsperioderResponse);
  }),

  // Hent alle innsendte rapporteringsperioder
  http.get(`${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder/innsendte`, ({ request }) => {
    const url = new URL(request.url);
    const scenerio = url.searchParams.get("scenerio") as ScenerioType;

    return HttpResponse.json(hentInnsendtePerioder(scenerio));
  }),

  // Hent gjeldende rapporteringsperiode
  http.get(`${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperiode/gjeldende`, () => {
    return HttpResponse.json(gjeldendePeriodeResponse);
  }),

  // Godkjenn rapporteringsperiode
  http.post(
    `${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder/:rapporteringsperioderId/godkjenn`,
    () => {
      return new HttpResponse(null, { status: 200 });
    }
  ),

  // Avgodkjenn rapporteringsperiode
  http.post(
    `${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder/:rapporteringsperioderId/avgodkjenn`,
    () => {
      return new HttpResponse(null, { status: 200 });
    }
  ),

  // Hent spesifikk rapporteringsperiode
  http.get(`${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperiode/:rapporteringsperioderId`, () => {
    // const { rapporteringsperioderId } = params;

    // const rapporteringPeriode = rapporteringsperioderResponse.find(
    //   (periode) => periode.id === rapporteringsperioderId
    // );

    return HttpResponse.json(gjeldendePeriodeResponse);
  }),

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
    () => {
      return new HttpResponse(null, { status: 204 });
    }
  ),

  // Slett en aktivitet
  http.delete(
    `${getEnv(
      "DP_RAPPORTERING_URL"
    )}/rapporteringsperioder/:rapporteringsperioderId/aktivitet/:aktivitetId`,
    () => {
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
