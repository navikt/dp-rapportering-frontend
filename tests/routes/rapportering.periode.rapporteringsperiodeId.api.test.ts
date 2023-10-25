// @vitest-environment node
import { rapporteringsperioderResponse } from "../../mocks/api-routes/rapporteringsperioderResponse";
import { HttpResponse, http } from "msw";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";
import { loader } from "~/routes/rapportering.periode.$rapporteringsperiodeId";
import { server } from "../../mocks/server";
import { endSessionMock, mockSession } from "../helpers/auth-helper";
import { catchErrorResponse } from "../helpers/response-helper";

describe("Hent en rapporteringsperiode", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterAll(() => server.close());
  afterEach(() => {
    server.resetHandlers();
    endSessionMock();
  });

  describe("Loader", () => {
    const testParams = {
      rapporteringsperiodeId: rapporteringsperioderResponse[0].id,
    };

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

    test("skal hente ut gjeldende rapporteringsperiode", async () => {
      mockSession();

      const response = await loader({
        request: new Request("http://localhost:3000"),
        params: testParams,
        context: {},
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.periode).toEqual(rapporteringsperioderResponse[0]);
    });

    test("skal gi tilbake feedback til viewet hvis backend-kallet feiler", async () => {
      server.use(
        http.get(
          `${process.env.DP_RAPPORTERING_URL}/rapporteringsperioder/${rapporteringsperioderResponse[0].id}`,
          () => {
            return HttpResponse.json(null, { status: 500 });
          },
          { once: true }
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
  });
});
