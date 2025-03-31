import { http, HttpResponse } from "msw";
import { afterAll, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

import {
  lagreAktivitet,
  slettAlleAktiviteterForRapporteringsperioden,
} from "~/models/aktivitet.server";

import { rapporteringsperioderResponse } from "../../mocks/responses/rapporteringsperioderResponse";
import { server } from "../../mocks/server";

const baseUrl = `${process.env.DP_RAPPORTERING_URL}/rapporteringsperiode/`;

vi.mock("~/utils/fetch.utils", () => ({
  getHeaders: vi.fn(() => ({
    "Content-Type": "application/json",
    Accept: "application",
    Authorization: "Bearer token",
  })),
}));

vi.mock("~/models/logger.server", () => ({
  logErrorResponse: vi.fn(),
}));

beforeEach(() => server.resetHandlers());
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterAll(() => server.close());

describe("aktivitet", () => {
  const rapporteringsperiodeId = rapporteringsperioderResponse[0].id;
  const dag = {
    dato: "2023-05-02",
    aktiviteter: [],
    dagIndex: 0,
  };
  const urlLagreAktivitet = `${baseUrl}/${rapporteringsperiodeId}/aktivitet`;
  const urlSlettAktiviteter = `${baseUrl}/${rapporteringsperiodeId}/aktiviteter`;

  describe("lagreAktivitet", () => {
    test("lager aktivitet vellykket", async () => {
      server.use(
        http.post(urlLagreAktivitet, () =>
          HttpResponse.json({ status: "success" }, { status: 200 }),
        ),
      );

      const request = new Request(urlLagreAktivitet);
      const response = await lagreAktivitet(request, rapporteringsperiodeId, dag);
      expect(response).toEqual({ status: "success" });
    });

    test("feil ved lagring av aktivitet", async () => {
      server.use(http.post(urlLagreAktivitet, () => new HttpResponse(null, { status: 500 })));

      const request = new Request(urlLagreAktivitet);
      try {
        await lagreAktivitet(request, rapporteringsperiodeId, dag);
      } catch (error) {
        expect((error as Response).status).toBe(500);
        expect(await (error as Response).text()).toBe("rapportering-feilmelding-lagre-aktivitet");
      }
    });
  });

  describe("slettAlleAktiviteterForRapporteringsperioden", () => {
    test("sletter aktiviteter vellykket", async () => {
      server.use(
        http.delete(urlSlettAktiviteter, () =>
          HttpResponse.json({ status: "success" }, { status: 200 }),
        ),
      );

      const request = new Request(urlSlettAktiviteter);
      const response = await slettAlleAktiviteterForRapporteringsperioden(
        request,
        rapporteringsperiodeId,
      );
      expect(response).toEqual({ status: "success" });
    });

    test("feil ved sletting av aktiviteter", async () => {
      server.use(http.delete(urlSlettAktiviteter, () => new HttpResponse(null, { status: 500 })));

      const request = new Request(urlSlettAktiviteter);
      try {
        await slettAlleAktiviteterForRapporteringsperioden(request, rapporteringsperiodeId);
      } catch (error) {
        expect((error as Response).status).toBe(500);
        expect(await (error as Response).text()).toBe("rapportering-feilmelding-lagre-aktivitet");
      }
    });
  });
});
