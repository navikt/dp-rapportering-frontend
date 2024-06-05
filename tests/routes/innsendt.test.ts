// @vitest-environment node
import { innsendtRapporteringsperioderResponse } from "mocks/responses/innsendtRapporteringsperioderResponse";
import { HttpResponse, http } from "msw";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";
import { loader } from "~/routes/innsendt";
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
        http.get(
          `${process.env.DP_RAPPORTERING_URL}/rapporteringsperioder/innsendte`,
          () => {
            return HttpResponse.json({ errorMessage: "error" }, { status: 500 });
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
          params: testParams,
          context: {},
        })
      );

      expect(response.status).toBe(500);
    });

    test("Skal hente ut innsendte rapporteringsperiode", async () => {
      mockSession();

      server.use(
        http.get(
          `${process.env.DP_RAPPORTERING_URL}/rapporteringsperioder/gjeldende`,
          () => {
            return HttpResponse.json(null, { status: 404 });
          },
          { once: true }
        )
      );

      server.use(
        http.get(
          `${process.env.DP_RAPPORTERING_URL}/rapporteringsperioder/innsendte`,
          () => {
            return HttpResponse.json(innsendtRapporteringsperioderResponse, { status: 200 });
          },
          { once: true }
        )
      );

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
