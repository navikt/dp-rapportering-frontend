// @vitest-environment node
import { HttpResponse, http } from "msw";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";
import { action } from "~/routes/rapportering.periode.$rapporteringsperiodeId.fyll-ut";
import { rapporteringsperioderResponse } from "../../mocks/api-routes/rapporteringsperioderResponse";
import { server } from "../../mocks/server";
import { endSessionMock, mockSession } from "../helpers/auth-helper";

describe("Fyll ut rapporteringsperiode", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
  afterAll(() => server.close());
  afterEach(() => {
    server.resetHandlers();
    endSessionMock();
  });

  describe("Action", () => {
    const testAktivitet = {
      id: "4a49e571-6384-4eab-9c2e-3f4d48d30b9b",
      type: "Arbeid",
      timer: "5", // Dette omgjøres til en ISO-8601 periode før den sendes til backend, sluttbruker skriver inn vanlige tall
      dato: "2023-05-02",
    };

    describe("Lagre aktivitet", () => {
      const testBody = {
        aktivitetId: testAktivitet.id,
        type: testAktivitet.type,
        dato: testAktivitet.dato,
        timer: testAktivitet.timer,
        submit: "lagre",
      };

      const testParams = {
        ident: "1234",
        rapporteringsperiodeId: rapporteringsperioderResponse[0].id,
      };

      test("burde kunne lagre en aktivitet", async () => {
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

        expect(response.status).toBe("success");
      });

      test("burde feile hvis backend feiler", async () => {
        const body = new URLSearchParams(testBody);

        const request = new Request("http://localhost:3000", {
          method: "POST",
          body,
        });

        server.use(
          http.post(
            `${process.env.DP_RAPPORTERING_URL}/rapporteringsperioder/:rapporteringsperioderId/aktivitet`,
            () => {
              return HttpResponse.json({ errorMessage: `Server Error` }, { status: 500 });
            },
            {
              once: true,
            }
          )
        );

        mockSession();

        const response = await action({
          request,
          params: testParams,
          context: {},
        });

        expect(response.status).toBe("error");
      });
    });

    describe("Slette aktivitet", () => {
      const testBody = {
        aktivitetId: testAktivitet.id,
        type: testAktivitet.type,
        dato: testAktivitet.dato,
        timer: testAktivitet.timer,
        submit: "slette",
      };
      const testParams = {
        ident: "1234",
        rapporteringsperiodeId: rapporteringsperioderResponse[0].id,
      };

      test("burde kunne slette en aktivitet", async () => {
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

        expect(response.status).toBe("success");
      });

      test("burde feile hvis backend feiler", async () => {
        const body = new URLSearchParams(testBody);

        const request = new Request("http://localhost:3000", {
          method: "POST",
          body,
        });

        server.use(
          http.delete(
            `${process.env.DP_RAPPORTERING_URL}/rapporteringsperioder/:rapporteringsperioderId/aktivitet/:aktivitetId`,
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

        expect(response.status).toBe("error");
      });
    });
  });
});
