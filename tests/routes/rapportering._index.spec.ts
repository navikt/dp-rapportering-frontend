// @vitest-environment node
import { gjeldendePeriodeResponse } from "mocks/api-routes/gjeldendePeriodeResponse";
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

  describe("Loader: ", () => {
    test("Skal feile hvis bruker ikke er logget på", async () => {
      const response = await catchErrorResponse(() =>
        loader({
          request: new Request("http://localhost:3000"),
          params: {},
          context: {},
        })
      );

      expect(response.status).toBe(500);
    });

    test("Skal feile hvis kallet til gjelende rapporteringsperioder feilet", async () => {
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
          params: {},
          context: {},
        })
      );

      expect(response.status).toBe(500);
    });

    test("Skal hente ut gjeldende rapporteringsperiode", async () => {
      const mock = mockSession();

      const response = await loader({
        request: new Request("http://localhost:3000"),
        params: {},
        context: {},
      });

      const data = await response.json();

      expect(mock.getSession).toHaveBeenCalledTimes(1);
      expect(response.status).toBe(200);
      expect(data).toEqual({
        gjeldendePeriode: gjeldendePeriodeResponse,
      });
    });

    test("Skal vise at bruker har ingen gjeldene perdiode", async () => {
      server.use(
        rest.get(
          `${process.env.DP_RAPPORTERING_URL}/rapporteringsperioder/gjeldende`,
          (_, res, ctx) => {
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
      });
    });
  });
});
