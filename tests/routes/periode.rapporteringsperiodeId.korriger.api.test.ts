// @vitest-environment node
import { redirect } from "@remix-run/node";
import { HttpResponse, http } from "msw";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";
import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { loader } from "~/routes/periode.$rapporteringsperiodeId.korriger";
import { rapporteringsperioderResponse } from "../../mocks/responses/rapporteringsperioderResponse";
import { server } from "../../mocks/server";
import { endSessionMock, mockSession } from "../helpers/auth-helper";
import { catchErrorResponse } from "../helpers/response-helper";

describe("Start korrigering", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterAll(() => server.close());
  afterEach(() => {
    server.resetHandlers();
    endSessionMock();
  });

  describe("Loader: ", () => {
    const testParams = {
      rapporteringsperiodeId: rapporteringsperioderResponse[0].id,
    };

    test("Skal redirecte etter laging av ny korrigeringsperiode", async () => {
      const korrigeringsPeriode: IRapporteringsperiode = {
        ...rapporteringsperioderResponse[0],
        id: rapporteringsperioderResponse[0].id + 1,
        status: "Korrigert",
      };
      server.use(
        http.post(
          `${process.env.DP_RAPPORTERING_URL}/rapporteringsperiode/${testParams.rapporteringsperiodeId}/korriger`,
          () => {
            return HttpResponse.json(korrigeringsPeriode);
          },
          {
            once: true,
          }
        )
      );

      mockSession();

      const response = await loader({
        request: new Request("http://localhost:3000"),
        params: testParams,
        context: {},
      });

      expect(response).toEqual(redirect(`/periode/${korrigeringsPeriode.id}/fyll-ut`));
    });

    test("Skal feile hvis kallet til den bestemte rapporteringsperiode feiler", async () => {
      server.use(
        http.post(
          `${process.env.DP_RAPPORTERING_URL}/rapporteringsperiode/${testParams.rapporteringsperiodeId}/korriger`,
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
