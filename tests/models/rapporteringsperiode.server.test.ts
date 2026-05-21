import { format, subDays } from "date-fns";
import { http, HttpResponse } from "msw";
import { afterAll, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

import { lagRapporteringsperiode } from "~/devTools/rapporteringsperiode";
import { hentRapporteringsperioder, sendInnPeriode } from "~/models/rapporteringsperiode.server";
import { KortType, OPPRETTET_AV } from "~/utils/types";

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
      }),
    );

    expect(await hentRapporteringsperioder(request)).toEqual(rapporteringsperioder);
  });

  test("ingen rapportering funnet", async () => {
    server.use(
      http.get(url, () => {
        return new HttpResponse(null, { status: 204 });
      }),
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
      }),
    );

    try {
      await hentRapporteringsperioder(request);
    } catch (error) {
      expect((error as Response).status).toBe(500);
      expect(await (error as Response).text()).toBe("rapportering-feilmelding-hent-perioder");
    }
  });

  describe("sendInnPeriode", () => {
    const sendInnUrl = `${process.env.DP_RAPPORTERING_URL}/rapporteringsperiode`;

    test("skal sende registrertArbeidssoker som null når meldekortet sendes for sent", async () => {
      const pastertDato = format(subDays(new Date(), 7), "yyyy-MM-dd");
      const periode = lagRapporteringsperiode({
        sisteFristForTrekk: pastertDato,
        registrertArbeidssoker: true,
      });

      let capturedBody: { registrertArbeidssoker: boolean | null } | null = null;

      server.use(
        http.post(sendInnUrl, async ({ request }) => {
          capturedBody = (await request.json()) as { registrertArbeidssoker: boolean | null };
          return HttpResponse.json({ id: "123", status: "OK" }, { status: 200 });
        }),
      );

      const formData = new FormData();
      formData.append("_html", "<html>Test</html>");
      const request = new Request(sendInnUrl, {
        method: "POST",
        body: formData,
      });

      await sendInnPeriode(request, periode);

      expect(capturedBody).toBeDefined();
      expect(capturedBody!.registrertArbeidssoker).toBe(null);
    });

    test("skal sende registrertArbeidssoker som true når perioden er etterregistrert", async () => {
      const periode = lagRapporteringsperiode({
        type: KortType.ETTERREGISTRERT,
        registrertArbeidssoker: null,
      });

      let capturedBody: { registrertArbeidssoker: boolean | null } | null = null;

      server.use(
        http.post(sendInnUrl, async ({ request }) => {
          capturedBody = (await request.json()) as { registrertArbeidssoker: boolean | null };
          return HttpResponse.json({ id: "123", status: "OK" }, { status: 200 });
        }),
      );

      const formData = new FormData();
      formData.append("_html", "<html>Test</html>");
      const request = new Request(sendInnUrl, {
        method: "POST",
        body: formData,
      });

      await sendInnPeriode(request, periode);

      expect(capturedBody).toBeDefined();
      expect(capturedBody!.registrertArbeidssoker).toBe(true);
    });

    test("skal sende registrertArbeidssoker som true når perioden er opprettet av Arena", async () => {
      const periode = lagRapporteringsperiode({
        opprettetAv: OPPRETTET_AV.Arena,
        registrertArbeidssoker: null,
      });

      let capturedBody: { registrertArbeidssoker: boolean | null } | null = null;

      server.use(
        http.post(sendInnUrl, async ({ request }) => {
          capturedBody = (await request.json()) as { registrertArbeidssoker: boolean | null };
          return HttpResponse.json({ id: "123", status: "OK" }, { status: 200 });
        }),
      );

      const formData = new FormData();
      formData.append("_html", "<html>Test</html>");
      const request = new Request(sendInnUrl, {
        method: "POST",
        body: formData,
      });

      await sendInnPeriode(request, periode);

      expect(capturedBody).toBeDefined();
      expect(capturedBody!.registrertArbeidssoker).toBe(true);
    });

    test("skal beholde eksisterende registrertArbeidssoker verdi når ingen spesielle regler gjelder", async () => {
      const periode = lagRapporteringsperiode({
        registrertArbeidssoker: false,
      });

      let capturedBody: { registrertArbeidssoker: boolean | null } | null = null;

      server.use(
        http.post(sendInnUrl, async ({ request }) => {
          capturedBody = (await request.json()) as { registrertArbeidssoker: boolean | null };
          return HttpResponse.json({ id: "123", status: "OK" }, { status: 200 });
        }),
      );

      const formData = new FormData();
      formData.append("_html", "<html>Test</html>");
      const request = new Request(sendInnUrl, {
        method: "POST",
        body: formData,
      });

      await sendInnPeriode(request, periode);

      expect(capturedBody).toBeDefined();
      expect(capturedBody!.registrertArbeidssoker).toBe(false);
    });
  });
});
