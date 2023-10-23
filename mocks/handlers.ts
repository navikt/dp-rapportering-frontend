import { rest } from "msw";
import { getEnv } from "~/utils/env.utils";
import { gjeldendePeriodeResponse } from "./api-routes/gjeldendePeriodeResponse";
import { rapporteringsperioderResponse } from "./api-routes/rapporteringsperioderResponse";
import { sanityResponse } from "./api-routes/sanityResponse";

export const handlers = [
  // Hent alle rapporteringsperioder
  rest.get(`${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder`, (req, res, ctx) => {
    return res(ctx.json(rapporteringsperioderResponse));
  }),

  // Hent gjeldende rapporteringsperiode
  rest.get(`${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder/gjeldende`, (req, res, ctx) => {
    return res(ctx.json(gjeldendePeriodeResponse));
  }),

  // Godkjenn rapporteringsperiode
  rest.post(
    `${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder/:rapporteringsperioderId/godkjenn`,
    (req, res, ctx) => {
      return res(ctx.status(200));
    }
  ),

  // Avgodkjenn rapporteringsperiode
  rest.post(
    `${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder/:rapporteringsperioderId/avgodkjenn`,
    (req, res, ctx) => {
      return res(ctx.status(200));
    }
  ),

  // Hent spesifikk rapporteringsperiode
  rest.get(
    `${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder/:rapporteringsperioderId`,
    (req, res, ctx) => {
      const rapporteringPeriode = rapporteringsperioderResponse.find(
        (periode) => periode.id === req.params.rapporteringsperioderId
      );

      return res(ctx.json(rapporteringPeriode));
    }
  ),

  // Start korrigering av rapporteringsperiode
  rest.post(
    `${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder/:rapporteringsperioderId/korrigering`,
    (req, res, ctx) => {
      return res(ctx.json(rapporteringsperioderResponse[1]));
    }
  ),

  // Lagre en aktivitet
  rest.post(
    `${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder/:rapporteringsperioderId/aktivitet`,
    (req, res, ctx) => {
      return res(ctx.status(204));
    }
  ),

  // Slett en aktivitet
  rest.delete(
    `${getEnv(
      "DP_RAPPORTERING_URL"
    )}/rapporteringsperioder/:rapporteringsperioderId/aktivitet/:aktivitetId`,
    (req, res, ctx) => {
      return res(ctx.status(204));
    }
  ),

  rest.get(
    "https://rt6o382n.apicdn.sanity.io/v2021-06-06/data/query/production",
    (req, res, ctx) => {
      return res(ctx.json(sanityResponse));
    }
  ),
];
