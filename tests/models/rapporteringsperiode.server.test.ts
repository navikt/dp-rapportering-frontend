import { http, HttpResponse } from "msw";
import { afterAll, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

import { lagRapporteringsperiode } from "~/devTools/rapporteringsperiode";
import type { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { hentRapporteringsperioder, sendInnPeriode } from "~/models/rapporteringsperiode.server";
import { DP_RAPPORTERING_URL } from "~/utils/env.utils";
import { ARBEIDSSOKERSTATUS_AARSAK, KortType } from "~/utils/types";
import { erNyArbeidssokerstatusFlytAktiv } from "~/utils/unleash.server";

import { server } from "../../mocks/server";

vi.mock("~/utils/unleash.server", () => ({
  erNyArbeidssokerstatusFlytAktiv: vi.fn(),
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
  vi.mocked(erNyArbeidssokerstatusFlytAktiv).mockResolvedValue(false);
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
      vi.mocked(erNyArbeidssokerstatusFlytAktiv).mockResolvedValue(true);
      const periode = lagRapporteringsperiode({
        type: KortType.ORDINAERT,
        registrertArbeidssoker: false,
        sporsmalOmRegistrertArbeidssoker: {
          svarFraBruker: false,
          arsakBrukerHarIkkeSvart: null,
        },
      });

      const payload = await sendInn(periode);

      expect(payload?.registrertArbeidssoker).toEqual(false);
      expect(payload?.sporsmalOmRegistrertArbeidssoker).toEqual({
        svarFraBruker: false,
        arsakBrukerHarIkkeSvart: null,
      });
    });

    test("sender ikke gammelt etterregistrert ja som nytt svar", async () => {
      vi.mocked(erNyArbeidssokerstatusFlytAktiv).mockResolvedValue(true);
      const periode = lagRapporteringsperiode({
        type: KortType.ETTERREGISTRERT,
        registrertArbeidssoker: true,
      });

      const payload = await sendInn(periode);

      expect(payload?.registrertArbeidssoker).toEqual(null);
      expect(payload?.sporsmalOmRegistrertArbeidssoker).toEqual({
        svarFraBruker: null,
        arsakBrukerHarIkkeSvart: ARBEIDSSOKERSTATUS_AARSAK.ETTERREGISTRERT_MELDEKORT,
      });
    });

    test("sender null svar for årsaker der bruker ikke kan svare", async () => {
      vi.mocked(erNyArbeidssokerstatusFlytAktiv).mockResolvedValue(true);
      const aarsak = ARBEIDSSOKERSTATUS_AARSAK.ETTERREGISTRERT_MELDEKORT;
      const periode = lagRapporteringsperiode({
        type: KortType.ETTERREGISTRERT,
        registrertArbeidssoker: true,
        sporsmalOmRegistrertArbeidssoker: { svarFraBruker: true, arsakBrukerHarIkkeSvart: aarsak },
      });

      const payload = await sendInn(periode);

      expect(payload?.registrertArbeidssoker).toEqual(null);
      expect(payload?.sporsmalOmRegistrertArbeidssoker).toEqual({
        svarFraBruker: null,
        arsakBrukerHarIkkeSvart: aarsak,
      });
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
        sporsmalOmRegistrertArbeidssoker: {
          svarFraBruker: false,
          arsakBrukerHarIkkeSvart: null,
        },
      });

      const payload = await sendInn(periode);

      expect(payload?.registrertArbeidssoker).toBe(false);
      expect(payload?.sporsmalOmRegistrertArbeidssoker).toEqual(undefined);
    });

    test("bevarer legacy-svar uavhengig av årsak når flagget er av", async () => {
      const periode = lagRapporteringsperiode({
        registrertArbeidssoker: true,
        sporsmalOmRegistrertArbeidssoker: {
          svarFraBruker: true,
          arsakBrukerHarIkkeSvart:
            ARBEIDSSOKERSTATUS_AARSAK.DAGPENGER_HAR_IKKE_ANSVAR_FOR_SPORSMAL_OM_ARBEIDSSOKERSTATUS,
        },
      });

      const payload = await sendInn(periode);

      expect(payload?.registrertArbeidssoker).toBe(true);
    });
  });
});
