import { getAmplitudeInstance } from "@navikt/nav-dekoratoren-moduler";
import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, Mock, test, vi } from "vitest";

import { lagRapporteringsperiode } from "~/devTools/rapporteringsperiode";
import { useAnalytics } from "~/hooks/useAnalytics";
import { Rapporteringstype } from "~/utils/types";

vi.unmock("~/hooks/useAnalytics");

vi.mock("@navikt/nav-dekoratoren-moduler", () => ({
  getAmplitudeInstance: vi.fn().mockReturnValue(vi.fn()),
}));

vi.mock("~/hooks/useLocale", () => ({
  useLocale: () => ({ locale: "no" }),
}));

const env: { [key: string]: string } = {
  UMAMI_ID: "",
  SKAL_LOGGE: "true",
};

vi.mock("~/utils/env.utils", () => ({
  getEnv: (name: string) => env[name],
  isLocalOrDemo: false,
}));

describe("useAnalytics", () => {
  const skjemanavn = "dagpenger-rapportering";
  const språk = "no";
  const trackMock = vi.fn();
  beforeEach(() => {
    (getAmplitudeInstance as Mock).mockReturnValue(trackMock);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Vanlig rapporteringsskjema", () => {
    test("tracker 'skjema startet' hendelsen riktig", () => {
      const skjemaId = "123456";

      const { result } = renderHook(() => useAnalytics());
      result.current.trackSkjemaStartet(skjemaId, false);

      expect(trackMock).toHaveBeenCalledWith("skjema startet", {
        skjemanavn,
        skjemaId,
        språk,
        endring: false,
      });
    });

    test("tracker 'skjema fullført' hendelsen riktig", () => {
      const skjemaId = "123456";
      const rapporteringstype = Rapporteringstype.harAktivitet;

      const { result } = renderHook(() => useAnalytics());
      result.current.trackSkjemaFullført(skjemaId, rapporteringstype, false);

      expect(trackMock).toHaveBeenCalledWith("skjema fullført", {
        skjemanavn,
        skjemaId,
        språk,
        rapporteringstype,
        endring: false,
      });
    });

    test("tracker 'skjema steg fullført' hendelsen riktig", () => {
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

      expect(trackMock).toHaveBeenCalledWith("skjema steg fullført", {
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
    test("tracker 'skjema startet' hendelsen riktig", () => {
      const skjemaId = "123456";

      const { result } = renderHook(() => useAnalytics());
      result.current.trackSkjemaStartet(skjemaId, true);

      expect(trackMock).toHaveBeenCalledWith("skjema startet", {
        skjemanavn,
        skjemaId,
        språk,
        endring: true,
      });
    });

    test("tracker 'skjema innsending feilet' hendelsen riktig", () => {
      const skjemaId = "123456";
      const rapporteringstype = Rapporteringstype.harAktivitet;

      const { result } = renderHook(() => useAnalytics());
      result.current.trackSkjemaInnsendingFeilet(skjemaId, rapporteringstype, true);

      expect(trackMock).toHaveBeenCalledWith("skjema innsending feilet", {
        skjemanavn,
        skjemaId,
        språk,
        rapporteringstype,
        endring: true,
      });
    });
  });
});
