// @vitest-environment node
import { redirect } from "@remix-run/node";
import { HttpResponse, http } from "msw";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";
import { action } from "~/routes/periode.$rapporteringsperiodeId.send-inn";
import { rapporteringsperioderResponse } from "../../mocks/responses/rapporteringsperioderResponse";
import { server } from "../../mocks/server";
import { endSessionMock, mockSession } from "../helpers/auth-helper";
import { catchErrorResponse } from "../helpers/response-helper";

const rapporteringsperiodeResponse = rapporteringsperioderResponse[0];

describe("Send inn rapporteringsperiode", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
  afterAll(() => server.close());
  afterEach(() => {
    server.resetHandlers();
    endSessionMock();
  });

  describe("Action", () => {
    describe("Send inn periode", () => {
      const testBody = {};
      const testParams = {
        ident: "1234",
        rapporteringsperiodeId: rapporteringsperioderResponse[0].id,
      };

      test("burde feile hvis bruker ikke er autentisert", async () => {
        const body = new URLSearchParams(testBody);

        const request = new Request("http://localhost:3000", {
          method: "POST",
          body,
        });

        const response = await catchErrorResponse(() =>
          action({
            request,
            params: testParams,
            context: {},
          })
        );

        expect(response.status).toBe(500);
      });

      test("burde kunne godkjenne og redirecte til riktig side", async () => {
        const body = new URLSearchParams(testBody);

        const request = new Request("http://localhost:3000", {
          method: "POST",
          body,
        });

        server.use(
          http.get(
            `${process.env.DP_RAPPORTERING_URL}/rapporteringsperiode/:rapporteringsperioderId`,
            () => {
              return HttpResponse.json(rapporteringsperiodeResponse, { status: 200 });
            }
          )
        );

        mockSession();

        const response = await action({
          request,
          params: testParams,
          context: {},
        });

        expect(response).toEqual(
          redirect(`/periode/${rapporteringsperioderResponse[0].id}/bekreftelse`)
        );
      });

      test("burde feile hvis backend feiler", async () => {
        const body = new URLSearchParams(testBody);

        const request = new Request("http://localhost:3000", {
          method: "POST",
          body,
        });

        server.use(
          http.post(
            `${process.env.DP_RAPPORTERING_URL}/rapporteringsperiode`,
            () => {
              return HttpResponse.json(null, { status: 500 });
            },
            { once: true }
          )
        );

        server.use(
          http.get(
            `${process.env.DP_RAPPORTERING_URL}/rapporteringsperiode/:rapporteringsperioderId`,
            () => {
              return HttpResponse.json(rapporteringsperiodeResponse, { status: 200 });
            }
          )
        );
        mockSession();

        const response = await action({
          request,
          params: testParams,
          context: {},
        });

        const data = await response.json();
        expect(response.status).toBe(200);
        expect(data.error).toBe("Det har skjedd noe feil med innsendingen din, prøv igjen.");
      });
    });
  });
});
