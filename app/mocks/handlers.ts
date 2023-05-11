import { rest } from 'msw';
import { getEnv } from '~/utils/env.utils';
import { meldekortResponse } from './api-routes/meldekortResponse';

export const handlers = [
  // Hent meldekortPerioder
  rest.get(`${getEnv('DP_RAPPORTERING_URL')}/perioder`, (req, res, ctx) => {
    return res(ctx.json(meldekortResponse));
  }),

  // Lagre timer per periodeId
  rest.put(`${getEnv('DP_RAPPORTERING_URL')}}/periode/:periodeId`, (req, res, ctx) => {
    return res(ctx.status(200));
  }),
];
