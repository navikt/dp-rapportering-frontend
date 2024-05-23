import { gjeldendePeriodeResponse } from "./responses/gjeldendePeriodeResponse";
import { rapporteringsperioderResponse } from "./responses/rapporteringsperioderResponse";
import { HttpResponse, bypass, http } from "msw";
import { getEnv } from "~/utils/env.utils";

export const handlers = [
  // Hent alle rapporteringsperioder
  http.get(`${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder`, () => {
    return HttpResponse.json(rapporteringsperioderResponse);
  }),

  // Hent gjeldende rapporteringsperiode
  http.get(`${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder/gjeldende`, () => {
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
  http.get(
    `${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder/:rapporteringsperioderId`,
    ({ params }) => {
      const { rapporteringsperioderId } = params;

      const rapporteringPeriode = rapporteringsperioderResponse.find(
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
    `${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder/:rapporteringsperioderId/aktivitet`,
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
