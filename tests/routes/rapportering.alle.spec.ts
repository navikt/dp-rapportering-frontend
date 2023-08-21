// @vitest-environment node
import { rapporteringsperioderResponse } from "../../mocks/api-routes/rapporteringsperioderResponse";
import { rest } from "msw";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";
import { loader } from "~/routes/rapportering.alle";
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

  describe("Loader", () => {
    const testParams = {};

    test("skal feile hvis bruker ikke er logget på", async () => {
      const response = await catchErrorResponse(() =>
        loader({
          request: new Request("http://localhost:3000"),
          params: testParams,
          context: {},
        })
      );

      expect(response.status).toBe(500);
    });

    test("skal hente ut alle rapporteringsperioder", async () => {
      const mock = mockSession();

      server.use(
        rest.get(
          `${process.env.DP_RAPPORTERING_URL}/rapporteringsperioder/gjeldende`,
          (req, res, ctx) => {
            return res.once(ctx.status(200));
          }
        )
      );

      const response = await loader({
        request: new Request("http://localhost:3000"),
        params: testParams,
        context: {},
      });

      const data = await response.json();

      expect(mock.getSession).toHaveBeenCalledTimes(2);
      expect(response.status).toBe(200);
      expect(data).toEqual({ innsendtPerioder: rapporteringsperioderResponse });
    });

    test("skal feile hvis backend-kallet feiler", async () => {
      server.use(
        rest.get(`${process.env.DP_RAPPORTERING_URL}/rapporteringsperioder`, (req, res, ctx) => {
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
  });
});
