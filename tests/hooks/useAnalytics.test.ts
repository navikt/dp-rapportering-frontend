import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { lagRapporteringsperiode } from "~/devTools/rapporteringsperiode";
import { useAnalytics } from "~/hooks/useAnalytics";
import { Rapporteringstype } from "~/utils/types";

vi.unmock("~/hooks/useAnalytics");

const loggerMock = vi.fn();

vi.mock(import("@navikt/nav-dekoratoren-moduler"), async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    awaitDecoratorData: vi.fn().mockResolvedValue({}),
    getCurrentConsent: vi.fn().mockReturnValue({ consent: { analytics: true, surveys: true } }),
    getAnalyticsInstance: vi.fn(() => loggerMock),
  };
});

vi.mock("~/hooks/useLocale", () => ({
  useLocale: () => ({ locale: "no" }),
}));

vi.mock("~/utils/analytics", () => {
  return {
    redactId(url: string): string {
      return url;
    },
    hentData: async ({
      props,
      språk,
      skjemanavn,
    }: {
      props: object;
      språk: string;
      skjemanavn: string;
    }) => ({
      språk,
      skjemanavn,
      ...props,
    }),
  };
});

vi.mock("~/utils/env.utils", () => ({
  isLocalOrDemo: false,
}));

describe("useAnalytics", () => {
  const skjemanavn = "dagpenger-rapportering";
  const språk = "no";
  beforeEach(() => {
    loggerMock.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Vanlig rapporteringsskjema", () => {
    test("tracker 'skjema startet' hendelsen riktig", async () => {
      const skjemaId = "123456";

      const { result } = renderHook(() => useAnalytics());
      await result.current.trackSkjemaStartet(skjemaId, false);

      await waitFor(() =>
        expect(loggerMock).toHaveBeenCalledWith("skjema startet", {
          skjemanavn,
          skjemaId,
          språk,
          endring: false,
        }),
      );
    });

    test("tracker 'skjema fullført' hendelsen riktig", async () => {
      const skjemaId = "123456";
      const rapporteringstype = Rapporteringstype.harAktivitet;

      const { result } = renderHook(() => useAnalytics());
      result.current.trackSkjemaFullført(skjemaId, rapporteringstype, false);

      await Promise.resolve();
      await Promise.resolve();

      expect(loggerMock).toHaveBeenCalledWith("skjema fullført", {
        skjemanavn,
        skjemaId,
        språk,
        rapporteringstype,
        endring: false,
      });
    });

    test("tracker 'skjema steg fullført' hendelsen riktig", async () => {
      const skjemaId = "123456";
      const rapporteringstype = Rapporteringstype.harAktivitet;

      const { result } = renderHook(() => useAnalytics());
      const periode = lagRapporteringsperiode({ id: "123456", rapporteringstype });

      result.current.trackSkjemaStegFullført({
        periode,
        stegnavn: "Steg 1",
        steg: 1,
        endring: false,
      });

      await Promise.resolve();
      await Promise.resolve();

      expect(loggerMock).toHaveBeenCalledWith("skjema steg fullført", {
        skjemanavn,
        skjemaId,
        språk,
        stegnavn: "Steg 1",
        steg: 1,
        rapporteringstype,
        endring: false,
      });
    });
  });

  describe("Rapporteringsskjema med endring", () => {
    test("tracker 'skjema startet' hendelsen riktig", async () => {
      const skjemaId = "123456";

      const { result } = renderHook(() => useAnalytics());
      result.current.trackSkjemaStartet(skjemaId, true);

      await Promise.resolve();
      await Promise.resolve();

      expect(loggerMock).toHaveBeenCalledWith("skjema startet", {
        skjemanavn,
        skjemaId,
        språk,
        endring: true,
      });
    });

    test("tracker 'skjema innsending feilet' hendelsen riktig", async () => {
      const skjemaId = "123456";
      const rapporteringstype = Rapporteringstype.harAktivitet;

      const { result } = renderHook(() => useAnalytics());
      result.current.trackSkjemaInnsendingFeilet(skjemaId, rapporteringstype, true);

      await Promise.resolve();
      await Promise.resolve();

      expect(loggerMock).toHaveBeenCalledWith("skjema innsending feilet", {
        skjemanavn,
        skjemaId,
        språk,
        rapporteringstype,
        endring: true,
      });
    });
  });
});
