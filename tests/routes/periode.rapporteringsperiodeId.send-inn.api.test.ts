// @vitest-environment node
import { redirect } from "@remix-run/node";
import { HttpResponse, http } from "msw";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";
import { resetRapporteringstypeCookie } from "~/models/rapporteringstype.server";
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
      const testBody = {
        _html: "<div />",
      };
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

      test("burde feile hvis _html er null", async () => {
        const body = new URLSearchParams({});

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

      test("burde feile hvis _html er tom", async () => {
        const body = new URLSearchParams({ _html: "" });

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

      test("burde kunne sende inn og redirecte til riktig side", async () => {
        const body = new URLSearchParams(testBody);

        const request = new Request("http://localhost:3000", {
          method: "POST",
          body,
        });

        server.use(
          http.get(
            `${process.env.DP_RAPPORTERING_URL}/rapporteringsperiode/:rapporteringsperioderId`,
            () => {
              return HttpResponse.json({ id: "1" }, { status: 500 });
            }
          )
        );

        server.use(
          http.post(
            `${process.env.DP_RAPPORTERING_URL}/rapporteringsperiode`,
            async ({ request }) => {
              const sentRequest = await request.text();
              expect(sentRequest).toBe('{"id":"1","html":"<div />"}');

              return HttpResponse.json(null, {
                status: 200,
              });
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

        expect(response).toEqual(
          redirect(`/periode/${rapporteringsperiodeResponse.id}/bekreftelse`, {
            headers: {
              "Set-Cookie": await resetRapporteringstypeCookie(),
            },
          })
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
              return HttpResponse.json(null, {
                status: 500,
              });
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
        expect(response.status).toBe(500);

        expect(data.error).toBe("Det har skjedd noe feil med innsendingen din, prøv igjen.");
      });
    });
  });
});
