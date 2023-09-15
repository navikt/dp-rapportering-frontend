// @vitest-environment node
import { innsendtRapporteringsperioderResponse } from "mocks/api-routes/innsendtRapporteringsperioderResponse";
import { rest } from "msw";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";
import { loader } from "~/routes/rapportering.innsendt";
import { server } from "../../mocks/server";
import { endSessionMock, mockSession } from "../helpers/auth-helper";
import { catchErrorResponse } from "../helpers/response-helper";

describe("Liste ut alle rapporteringsperioder", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterAll(() => server.close());
  afterEach(() => {
    server.resetHandlers();
    endSessionMock();
  });

  describe("Loader:", () => {
    const testParams = {};

    test("Skal feile hvis bruker ikke er logget på", async () => {
      const response = await catchErrorResponse(() =>
        loader({
          request: new Request("http://localhost:3000"),
          params: testParams,
          context: {},
        })
      );

      expect(response.status).toBe(500);
    });

    test("Skal feile hvis uthenting av alle perioder feiler", async () => {
      server.use(
        rest.get(`${process.env.DP_RAPPORTERING_URL}/rapporteringsperioder`, (_, res, ctx) => {
          return res.once(
            ctx.status(500),
            ctx.json({
              errorMessage: `Server Error`,
            })
          );
        })
      );

      mockSession();

      const response = await catchErrorResponse(() =>
        loader({
          request: new Request("http://localhost:3000"),
          params: testParams,
          context: {},
        })
      );

      expect(response.status).toBe(500);
    });

    test("Skal feile hvis uthenting av gjeldende perioder feiler", async () => {
      server.use(
        rest.get(
          `${process.env.DP_RAPPORTERING_URL}/rapporteringsperioder/gjeldende`,
          (_, res, ctx) => {
            return res.once(
              ctx.status(500),
              ctx.json({
                errorMessage: `Server Error`,
              })
            );
          }
        )
      );

      mockSession();

      const response = await catchErrorResponse(() =>
        loader({
          request: new Request("http://localhost:3000"),
          params: testParams,
          context: {},
        })
      );

      expect(response.status).toBe(500);
    });

    test.skip("Skal hente ut innsendte rapporteringsperiode", async () => {
      server.use(
        rest.get(`${process.env.DP_RAPPORTERING_URL}/rapporteringsperioder`, (_, res, ctx) => {
          return res.once(ctx.status(200), ctx.json(innsendtRapporteringsperioderResponse));
        })
      );

      mockSession();

      const response = await loader({
        request: new Request("http://localhost:3000"),
        params: {},
        context: {},
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        innsendtPerioder: innsendtRapporteringsperioderResponse,
      });
    });
  });
});
