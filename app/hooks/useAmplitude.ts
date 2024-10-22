import { useLocale } from "./useLocale";
import { getAmplitudeInstance } from "@navikt/nav-dekoratoren-moduler";
import { useCallback } from "react";
import { Rapporteringstype } from "~/utils/types";

interface ISkjemaSteg {
  skjemaId: string;
  stegnavn: string;
  steg: number;
  rapporteringstype: Rapporteringstype | null;
}

const skjemanavn = "dagpenger-rapportering";

export function useAmplitude() {
  const track = getAmplitudeInstance("dekoratoren");

  const { locale: språk } = useLocale();

  const trackSkjemaStartet = useCallback(
    (skjemaId: string) => {
      track("skjema startet", {
        skjemanavn,
        skjemaId,
        språk,
      });
    },
    [track, språk]
  );

  const trackSkjemaFullført = useCallback(
    (skjemaId: string, rapporterinstype: Rapporteringstype | null) => {
      track("skjema fullført", {
        skjemanavn,
        skjemaId,
        rapporterinstype,
        språk,
      });
    },
    [track, språk]
  );

  const trackSkjemaInnsendingFeilet = useCallback(
    (skjemaId: string, rapporterinstype: Rapporteringstype | null) => {
      track("skjema innsending feilet", {
        skjemanavn,
        skjemaId,
        rapporterinstype,
        språk,
      });
    },
    [track, språk]
  );

  const trackSkjemaSteg = useCallback(
    ({ skjemaId, stegnavn, steg, rapporteringstype }: ISkjemaSteg) => {
      track("skjemasteg fullført", {
        skjemanavn,
        skjemaId,
        stegnavn,
        steg,
        rapporteringstype,
        språk,
      });
    },
    [track, språk]
  );

  return {
    trackSkjemaStartet,
    trackSkjemaFullført,
    trackSkjemaInnsendingFeilet,
    trackSkjemaSteg,
  };
}
