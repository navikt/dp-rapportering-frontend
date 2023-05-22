import { rest } from "msw";
import { getEnv } from "~/utils/env.utils";
import { rapporteringsperioderResponse } from "./api-routes/rapporteringsperioderResponse";

export const handlers = [
  rest.get(
    `${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder/:rapporteringsperioderId`,
    (req, res, ctx) => {
      const rapporteringPeriode = rapporteringsperioderResponse.find(
        (periode) => periode.id === req.params.rapporteringsperioderId
      );

      return res(ctx.json(rapporteringPeriode));
    }
  ),
];
