import { rest } from "msw";
import { getEnv } from "~/utils/env.utils";
import { rapporteringsperioderResponse } from "./api-routes/rapporteringsperioderResponse";

export const handlers = [
  rest.get(`${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder`, (req, res, ctx) => {
    return res(ctx.json(rapporteringsperioderResponse));
  }),
];
