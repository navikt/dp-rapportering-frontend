// @vitest-environment node
import { http, HttpResponse } from "msw";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";

import { loader } from "~/routes/periode.$rapporteringsperiodeId";

import { rapporteringsperioderResponse } from "../../mocks/responses/rapporteringsperioderResponse";
import { server } from "../../mocks/server";
import { endSessionMock, mockSession } from "../helpers/auth-helper";
import { catchErrorResponse } from "../helpers/response-helper";

const rapporteringsperiodeResponse = rapporteringsperioderResponse[0];

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
      const response = (await catchErrorResponse(() =>
        loader({
          request: new Request("http://localhost:3000"),
          params: testParams,
          context: {},
        }),
      )) as Response;

      expect(response.status).toBe(500);
    });

    test("skal hente ut rapporteringsperiode", async () => {
      server.use(
        http.get(
          `${process.env.DP_RAPPORTERING_URL}/rapporteringsperiode/:rapporteringsperiodeId`,
          () => {
            return HttpResponse.json(rapporteringsperiodeResponse, { status: 200 });
          },
        ),
      );

      mockSession();

      const response = await loader({
        request: new Request("http://localhost:3000"),
        params: testParams,
        context: {},
      });

      expect(response.periode).toEqual(rapporteringsperiodeResponse);
    });

    test("skal gi tilbake feedback til viewet hvis backend-kallet feiler", async () => {
      server.use(
        http.get(
          `${process.env.DP_RAPPORTERING_URL}/rapporteringsperiode/${rapporteringsperioderResponse[0].id}`,
          () => {
            return HttpResponse.json(null, { status: 500 });
          },
          { once: true },
        ),
      );

      mockSession();

      const response = (await catchErrorResponse(() =>
        loader({
          request: new Request("http://localhost:3000"),
          params: testParams,
          context: {},
        }),
      )) as Response;

      expect(response.status).toBe(500);
    });
  });
});
