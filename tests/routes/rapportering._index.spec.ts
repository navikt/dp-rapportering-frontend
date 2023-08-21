// @vitest-environment node
import { rapporteringsperioderResponse } from "../../mocks/api-routes/rapporteringsperioderResponse";
import { rest } from "msw";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";
import { loader } from "~/routes/rapportering._index";
import { server } from "../../mocks/server";
import { endSessionMock, mockSession } from "../helpers/auth-helper";
import { catchErrorResponse } from "../helpers/response-helper";

describe("Hovedside rapportering", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterAll(() => server.close());
  afterEach(() => {
    server.resetHandlers();
    endSessionMock();
  });

  describe("Loader", () => {
    test("skal feile hvis bruker ikke er logget på", async () => {
      const response = await catchErrorResponse(() =>
        loader({
          request: new Request("http://localhost:3000"),
          params: {},
          context: {},
        })
      );

      expect(response.status).toBe(500);
    });

    test("skal hente ut gjeldende rapporteringsperiode og innsendt perioder", async () => {
      const mock = mockSession();

      const response = await loader({
        request: new Request("http://localhost:3000"),
        params: {},
        context: {},
      });

      const data = await response.json();

      expect(mock.getSession).toHaveBeenCalledTimes(2);
      expect(response.status).toBe(200);
      expect(data).toEqual({
        gjeldendePeriode: rapporteringsperioderResponse[0],
        innsendtPerioder: [],
      });
    });

    test("skal vise at bruker har ingen gjeldene perdiode", async () => {
      server.use(
        rest.get(
          `${process.env.DP_RAPPORTERING_URL}/rapporteringsperioder/gjeldende`,
          (req, res, ctx) => {
            return res.once(ctx.status(404));
          }
        )
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
        gjeldendePeriode: null,
        innsendtPerioder: [],
      });
    });
  });
});
