import { rest } from "msw";
import { getEnv } from "~/utils/env.utils";
import { rapporteringsperioderResponse } from "./api-routes/rapporteringsperioderResponse";
import { sanityResponse } from "./api-routes/sanityResponse";

export const handlers = [
  rest.get(`${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder`, (req, res, ctx) => {
    return res(ctx.json(rapporteringsperioderResponse));
  }),

  rest.get(`${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder/gjeldende`, (req, res, ctx) => {
    return res(ctx.json(rapporteringsperioderResponse[0]));
  }),

  rest.post(
    `${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder/:rapporteringsperioderId/godkjenn`,
    (req, res, ctx) => {
      return res(ctx.status(200));
    }
  ),

  rest.get(
    `${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder/:rapporteringsperioderId`,
    (req, res, ctx) => {
      const rapporteringPeriode = rapporteringsperioderResponse.find(
        (periode) => periode.id === req.params.rapporteringsperioderId
      );

      return res(ctx.json(rapporteringPeriode));
    }
  ),

  rest.get(
    "https://rt6o382n.apicdn.sanity.io/v2021-06-06/data/query/production",
    (req, res, ctx) => {
      return res(ctx.json(sanityResponse));
    }
  ),
];
