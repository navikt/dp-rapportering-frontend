import { http, HttpResponse } from "msw";
import { afterAll, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

import { lagRapporteringsperiode } from "~/devTools/rapporteringsperiode";
import type { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { hentRapporteringsperioder, sendInnPeriode } from "~/models/rapporteringsperiode.server";
import { DP_RAPPORTERING_URL } from "~/utils/env.utils";
import { ARBEIDSSOKERSTATUS_AARSAK, KortType } from "~/utils/types";
import { skalAktivereSpm5Feature } from "~/utils/unleash.server";

import { server } from "../../mocks/server";

vi.mock("~/utils/unleash.server", () => ({
  skalAktivereSpm5Feature: vi.fn(),
}));

const url = `${process.env.DP_RAPPORTERING_URL}/rapporteringsperioder`;

vi.mock("~/utils/fetch.utils", () => ({
  getHeaders: vi.fn(() => ({
    "Content-Type": "application/json",
    Accept: "application",
    Authorization: "Bearer token",
  })),
  getCorrelationId: vi.fn(() => "123"),
}));

beforeEach(() => {
  server.resetHandlers();
  vi.mocked(skalAktivereSpm5Feature).mockResolvedValue(false);
});
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
    const innsendingsUrl = `${DP_RAPPORTERING_URL}/rapporteringsperiode`;

    async function sendInn(periode: IRapporteringsperiode) {
      const formData = new FormData();
      formData.set("_html", "<p>meldekort</p>");
      const request = new Request("http://localhost/send-inn", {
        method: "POST",
        body: formData,
      });

      let payload: IRapporteringsperiode | undefined;
      server.use(
        http.post(innsendingsUrl, async ({ request }) => {
          payload = (await request.json()) as IRapporteringsperiode;
          return HttpResponse.json({ id: periode.id });
        }),
      );

      await sendInnPeriode(request, periode);
      return payload;
    }

    test("bevarer svar når nytt payloadformat er aktivt", async () => {
      vi.mocked(skalAktivereSpm5Feature).mockResolvedValue(true);
      const periode = lagRapporteringsperiode({
        type: KortType.ETTERREGISTRERT,
        registrertArbeidssoker: { svar: false, aarsak: null },
      });

      const payload = await sendInn(periode);

      expect(payload?.registrertArbeidssoker).toEqual({ svar: false, aarsak: null });
    });

    test("sender null svar for årsaker der bruker ikke kan svare", async () => {
      vi.mocked(skalAktivereSpm5Feature).mockResolvedValue(true);
      const aarsak = ARBEIDSSOKERSTATUS_AARSAK.ETTERREGISTRERT_MELDEKORT;
      const periode = lagRapporteringsperiode({
        type: KortType.ETTERREGISTRERT,
        registrertArbeidssoker: { svar: true, aarsak },
      });

      const payload = await sendInn(periode);

      expect(payload?.registrertArbeidssoker).toEqual({ svar: null, aarsak });
    });

    test("beholder legacy-overstyring når nytt payloadformat er deaktivert", async () => {
      const periode = lagRapporteringsperiode({
        type: KortType.ETTERREGISTRERT,
        registrertArbeidssoker: false,
      });

      const payload = await sendInn(periode);

      expect(payload?.registrertArbeidssoker).toBe(true);
    });

    test("konverterer ny payload til legacy boolean når flagget slås av", async () => {
      const periode = lagRapporteringsperiode({
        registrertArbeidssoker: { svar: false, aarsak: null },
      });

      const payload = await sendInn(periode);

      expect(payload?.registrertArbeidssoker).toBe(false);
    });

    test("bevarer legacy-svar uavhengig av årsak når flagget er av", async () => {
      const periode = lagRapporteringsperiode({
        registrertArbeidssoker: {
          svar: true,
          aarsak:
            ARBEIDSSOKERSTATUS_AARSAK.DAGPENGER_HAR_IKKE_ANSVAR_FOR_SPORSMAL_OM_ARBEIDSSOKERSTATUS,
        },
      });

      const payload = await sendInn(periode);

      expect(payload?.registrertArbeidssoker).toBe(true);
    });
  });
});
