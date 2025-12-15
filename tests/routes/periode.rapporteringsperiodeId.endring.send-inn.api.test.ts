// @vitest-environment node
import { http, HttpResponse } from "msw";
import { redirect, UNSAFE_DataWithResponseInit } from "react-router";
import { uuidv7 } from "uuidv7";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";

import { action } from "~/routes/periode.$rapporteringsperiodeId.endring.send-inn";
import { IRapporteringsperiodeStatus } from "~/utils/types";

import { rapporteringsperioderResponse } from "../../mocks/responses/rapporteringsperioderResponse";
import { server } from "../../mocks/server";
import { endSessionMock, mockSession } from "../helpers/auth-helper";

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

      test("burde redirecte til bekreftelsesside hvis rapporteringen allerede er sendt inn", async () => {
        const body = new URLSearchParams(testBody);

        const request = new Request("http://localhost:3000", {
          method: "POST",
          body,
        });

        const id = uuidv7();

        server.use(
          http.get(
            `${process.env.DP_RAPPORTERING_URL}/rapporteringsperiode/:rapporteringsperiodeId`,
            () => {
              return HttpResponse.json(
                { id: id, kanSendes: false, status: IRapporteringsperiodeStatus.Innsendt },
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
                `{"id":"$id","kanSendes":true,"status":${IRapporteringsperiodeStatus.TilUtfylling},"html":"<div />"}`,
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
          unstable_pattern: "",
        });

        expect(response).toEqual(
          redirect(`/periode/${rapporteringsperiodeResponse.id}/endring/bekreftelse`),
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
          unstable_pattern: "",
        })) as UNSAFE_DataWithResponseInit<{ error: string }>;

        const data = response.data;
        expect(response.init?.status).toBe(400);

        expect(data.error).toBe("rapportering-feilmelding-kan-ikke-sendes");
      });
    });
  });
});
