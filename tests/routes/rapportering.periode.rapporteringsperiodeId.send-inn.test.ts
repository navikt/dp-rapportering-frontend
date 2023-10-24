// @vitest-environment node
import { redirect } from "@remix-run/node";
import { HttpResponse, http } from "msw";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";
import { action } from "~/routes/rapportering.periode.$rapporteringsperiodeId.send-inn";
import { rapporteringsperioderResponse } from "../../mocks/api-routes/rapporteringsperioderResponse";
import { server } from "../../mocks/server";
import { endSessionMock, mockSession } from "../helpers/auth-helper";
import { catchErrorResponse } from "../helpers/response-helper";

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

        mockSession();

        const response = await action({
          request,
          params: testParams,
          context: {},
        });

        expect(response).toEqual(
          redirect(`/rapportering/periode/${rapporteringsperioderResponse[0].id}/bekreftelse`)
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
            `${process.env.DP_RAPPORTERING_URL}/rapporteringsperioder/${rapporteringsperioderResponse[0].id}/godkjenn`,
            () => {
              return HttpResponse.json(
                {
                  errorMessage: `Server Error`,
                },
                { status: 500 }
              );
            },
            { once: true }
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
