import {
  perioderMedAktiviteter,
  perioderMedArbeidSykFravaer,
  perioderMedKunArbeid,
  perioderUtenAktiviteter,
} from "./../app/devTools/data";
import { mockDb } from "./mockDb";
import { rapporteringsperioderResponse } from "./responses/rapporteringsperioderResponse";
import { HttpResponse, bypass, http } from "msw";
import { ScenerioType } from "~/devTools";
import { ArbeidssokerSvar } from "~/models/arbeidssoker.server";
import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { getEnv } from "~/utils/env.utils";

const hentInnsendtePerioder = (scenerio?: ScenerioType) => {
  const innsendtePerioder = mockDb.rapporteringsperioder.getAll() as IRapporteringsperiode[];

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
      return mockDb.rapporteringsperioder.getAll();
  }
};

export const handlers = [
  // Hent alle rapporteringsperioder
  http.get(`${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder`, () => {
    const rapporteringsperioder = mockDb.rapporteringsperioder.getAll() as IRapporteringsperiode[];
    return HttpResponse.json(rapporteringsperioder);
  }),

  // Hent alle innsendte rapporteringsperioder
  http.get(`${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder/innsendte`, ({ request }) => {
    const url = new URL(request.url);
    const scenerio = url.searchParams.get("scenerio") as ScenerioType;

    return HttpResponse.json(hentInnsendtePerioder(scenerio));
  }),

  // Hent gjeldende rapporteringsperiode
  http.get(`${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperiode/gjeldende`, () => {
    const allePerioder = mockDb.rapporteringsperioder.getAll() as IRapporteringsperiode[];
    const rapporteringsperioder = allePerioder.filter((r) => r.status === "TilUtfylling");

    return HttpResponse.json(rapporteringsperioder[0]);
  }),

  // Send inn rapporteringsperiode
  http.post(`${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperiode`, () => {
    return new HttpResponse(null, { status: 200 });
  }),

  // Hent spesifikk rapporteringsperiode
  http.get(
    `${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperiode/:rapporteringsperioderId`,
    ({ params }) => {
      const { rapporteringsperioderId } = params;

      const rapporteringsperioder =
        mockDb.rapporteringsperioder.getAll() as IRapporteringsperiode[];

      const rapporteringPeriode = rapporteringsperioder.find(
        (periode) => periode.id === rapporteringsperioderId
      );

      return HttpResponse.json(rapporteringPeriode);
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
    () => {
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
      const { rapporteringsperioderId } = params;
      const { registrertArbeidssoker } = (await request.json()) as ArbeidssokerSvar;

      mockDb.rapporteringsperioder.update({
        where: {
          id: {
            equals: rapporteringsperioderId.toString(),
          },
        },
        data: {
          registrertArbeidssoker,
        },
      });

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
