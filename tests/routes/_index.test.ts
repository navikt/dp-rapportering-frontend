// @vitest-environment node
import { gjeldendePeriodeResponse } from "mocks/responses/gjeldendePeriodeResponse";
import { HttpResponse, http } from "msw";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";
import { loader } from "~/routes/_index";
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
        http.get(
          `${process.env.DP_RAPPORTERING_URL}/rapporteringsperioder/gjeldende`,
          () => {
            return HttpResponse.json(null, { status: 500 });
          },
          {
            once: true,
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
      mockSession();

      const response = await loader({
        request: new Request("http://localhost:3000"),
        params: {},
        context: {},
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        gjeldendePeriode: gjeldendePeriodeResponse,
      });
    });

    test("Skal vise at bruker har ingen gjeldene perdiode", async () => {
      server.use(
        http.get(
          `${process.env.DP_RAPPORTERING_URL}/rapporteringsperioder/gjeldende`,
          () => new HttpResponse(null, { status: 404 }),
          { once: true }
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
