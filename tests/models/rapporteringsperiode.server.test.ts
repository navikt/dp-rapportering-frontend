import { HttpResponse, http } from "msw";
import { beforeEach } from "node:test";
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { lagRapporteringsperiode } from "~/devTools/rapporteringsperiode";
import { hentRapporteringsperioder } from "~/models/rapporteringsperiode.server";
import { server } from "../../mocks/server";

const url = `${process.env.DP_RAPPORTERING_URL}/rapporteringsperioder`;

vi.mock("~/utils/fetch.utils", () => ({
  getHeaders: vi.fn(() => ({
    "Content-Type": "application/json",
    Accept: "application",
    Authorization: "Bearer token",
  })),
}));

beforeEach(() => server.resetHandlers());
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterAll(() => server.close());

describe("rapporteringsperiode.server", () => {
  const request = new Request(url);

  const rapporteringsperioder = [lagRapporteringsperiode()];
  test("henter rapporteringsperioder", async () => {
    server.use(
      http.get(url, () => {
        return HttpResponse.json(rapporteringsperioder, { status: 200 });
      })
    );

    expect(await hentRapporteringsperioder(request)).toEqual(rapporteringsperioder);
  });

  test("ingen rapportering funnet", async () => {
    server.use(
      http.get(url, () => {
        return new HttpResponse(null, { status: 204 });
      })
    );

    try {
      await hentRapporteringsperioder(request);
    } catch (error) {
      expect((error as Response).status).toBe(404);
      expect(await (error as Response).text()).toBe("rapportering-feilmelding-hent-perioder-404");
    }
  });

  test("henting av rapporteringsperioder feiler", async () => {
    server.use(
      http.get(url, () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    try {
      await hentRapporteringsperioder(request);
    } catch (error) {
      expect((error as Response).status).toBe(500);
      expect(await (error as Response).text()).toBe("rapportering-feilmelding-hent-perioder-500");
    }
  });
});
