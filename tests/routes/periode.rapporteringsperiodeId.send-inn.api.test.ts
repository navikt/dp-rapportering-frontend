// @vitest-environment node
import { http, HttpResponse } from "msw";
import { redirect, UNSAFE_DataWithResponseInit } from "react-router";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";

import { action } from "~/routes/periode.$rapporteringsperiodeId.send-inn";
import { IRapporteringsperiodeStatus } from "~/utils/types";

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

        const response = (await catchErrorResponse(() =>
          action({
            request,
            params: testParams,
            context: {},
          }),
        )) as UNSAFE_DataWithResponseInit<{ error: string }>;

        expect(response.init?.status).toBe(500);
      });

      test("burde feile hvis _html er null", async () => {
        const body = new URLSearchParams({});

        const request = new Request("http://localhost:3000", {
          method: "POST",
          body,
        });

        const response = (await catchErrorResponse(() =>
          action({
            request,
            params: testParams,
            context: {},
          }),
        )) as UNSAFE_DataWithResponseInit<{ error: string }>;

        expect(response.init?.status).toBe(500);
      });

      test("burde feile hvis _html er tom", async () => {
        const body = new URLSearchParams({ _html: "" });

        const request = new Request("http://localhost:3000", {
          method: "POST",
          body,
        });

        const response = (await catchErrorResponse(() =>
          action({
            request,
            params: testParams,
            context: {},
          }),
        )) as UNSAFE_DataWithResponseInit<{ error: string }>;

        expect(response.init?.status).toBe(500);
      });

      test("burde kunne sende inn og redirecte til riktig side", async () => {
        const body = new URLSearchParams(testBody);

        const request = new Request("http://localhost:3000", {
          method: "POST",
          body,
        });

        server.use(
          http.get(
            `${process.env.DP_RAPPORTERING_URL}/rapporteringsperiode/:rapporteringsperiodeId`,
            () => {
              return HttpResponse.json(
                {
                  id: rapporteringsperiodeResponse.id,
                  status: IRapporteringsperiodeStatus.TilUtfylling,
                  kanSendes: true,
                },
                { status: 200 },
              );
            },
          ),
        );

        server.use(
          http.post(
            `${process.env.DP_RAPPORTERING_URL}/rapporteringsperiode`,
            async ({ request }) => {
              const sentRequest = await request.text();

              expect(JSON.parse(sentRequest)).toEqual({
                id: rapporteringsperiodeResponse.id,
                status: "TilUtfylling",
                kanSendes: true,
                html: "<div />",
              });

              return HttpResponse.json({ id: rapporteringsperiodeResponse.id }, { status: 200 });
            },
          ),
        );

        mockSession();

        const response = await action({
          request,
          params: testParams,
          context: {},
        });

        expect(response).toEqual(
          redirect(`/periode/${rapporteringsperiodeResponse.id}/bekreftelse`),
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
            { once: true },
          ),
        );

        mockSession();

        const response = (await action({
          request,
          params: testParams,
          context: {},
        })) as UNSAFE_DataWithResponseInit<{ error: string }>;

        const data = response.data;
        expect(response.init?.status).toBe(500);

        expect(data.error).toBe("rapportering-feilmelding-feil-ved-innsending");
      });

      test("burde redirecte til bekreftelsesside hvis rapporteringen allerede er sendt inn", async () => {
        const body = new URLSearchParams(testBody);

        const request = new Request("http://localhost:3000", {
          method: "POST",
          body,
        });

        server.use(
          http.get(
            `${process.env.DP_RAPPORTERING_URL}/rapporteringsperiode/:rapporteringsperiodeId`,
            () => {
              return HttpResponse.json(
                { id: "1", kanSendes: false, status: IRapporteringsperiodeStatus.Innsendt },
                { status: 200 },
              );
            },
          ),
        );

        server.use(
          http.post(
            `${process.env.DP_RAPPORTERING_URL}/rapporteringsperiode`,
            async ({ request }) => {
              const sentRequest = await request.text();
              expect(sentRequest).toBe(
                `{"id":"1","kanSendes":true,"status":${IRapporteringsperiodeStatus.TilUtfylling},"html":"<div />"}`,
              );

              return HttpResponse.json(null, {
                status: 400,
              });
            },
            { once: true },
          ),
        );

        mockSession();

        const response = await action({
          request,
          params: testParams,
          context: {},
        });

        expect(response).toEqual(
          redirect(`/periode/${rapporteringsperiodeResponse.id}/bekreftelse`),
        );
      });

      test("burde vise feilmelding hvis perioden ikke kan sendes inn", async () => {
        const body = new URLSearchParams(testBody);

        const request = new Request("http://localhost:3000", {
          method: "POST",
          body,
        });

        server.use(
          http.get(
            `${process.env.DP_RAPPORTERING_URL}/rapporteringsperiode/:rapporteringsperiodeId`,
            () => {
              return HttpResponse.json({ id: "1", kanSendes: false }, { status: 200 });
            },
          ),
        );

        server.use(
          http.post(
            `${process.env.DP_RAPPORTERING_URL}/rapporteringsperiode`,
            async ({ request }) => {
              const sentRequest = await request.text();
              expect(sentRequest).toBe(
                `{"id":"1","kanSendes":true,"status":${IRapporteringsperiodeStatus.TilUtfylling},"html":"<div />"}`,
              );

              return HttpResponse.json(null, {
                status: 400,
              });
            },
            { once: true },
          ),
        );

        mockSession();

        const response = (await action({
          request,
          params: testParams,
          context: {},
        })) as UNSAFE_DataWithResponseInit<{ error: string }>;

        const data = response.data;
        expect(response.init?.status).toBe(400);

        expect(data.error).toBe("rapportering-feilmelding-kan-ikke-sendes");
      });
    });
  });
});
