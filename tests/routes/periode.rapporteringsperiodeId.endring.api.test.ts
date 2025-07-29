// @vitest-environment node
import { http, HttpResponse } from "msw";
import { redirect } from "react-router";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";

import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { loader } from "~/routes/periode.$rapporteringsperiodeId.endre";
import { IRapporteringsperiodeStatus } from "~/utils/types";

import { rapporteringsperioderResponse } from "../../mocks/responses/rapporteringsperioderResponse";
import { server } from "../../mocks/server";
import { endSessionMock, mockSession } from "../helpers/auth-helper";
import { catchErrorResponse } from "../helpers/response-helper";

describe("Start endring", () => {
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

    test("Skal redirecte etter laging av ny endringsperiode", async () => {
      const endringsPeriode: IRapporteringsperiode = {
        ...rapporteringsperioderResponse[0],
        id: rapporteringsperioderResponse[0].id + 1,
        status: IRapporteringsperiodeStatus.Endret,
      };
      server.use(
        http.post(
          `${process.env.DP_RAPPORTERING_URL}/rapporteringsperiode/${testParams.rapporteringsperiodeId}/endre`,
          () => {
            return HttpResponse.json(endringsPeriode);
          },
          {
            once: true,
          },
        ),
      );

      mockSession();

      const response = await loader({
        request: new Request("http://localhost:3000"),
        params: testParams,
        context: {},
      });

      expect(response).toEqual(redirect(`/periode/${endringsPeriode.id}/endring/fyll-ut`));
    });

    test("Skal feile hvis kallet til den bestemte rapporteringsperiode feiler", async () => {
      server.use(
        http.post(
          `${process.env.DP_RAPPORTERING_URL}/rapporteringsperiode/${testParams.rapporteringsperiodeId}/endre`,
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
