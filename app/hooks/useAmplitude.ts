import { getAmplitudeInstance } from "@navikt/nav-dekoratoren-moduler";
import { useCallback } from "react";

interface ISkjemaSteg {
  skjemaId: string;
  stegnavn: string;
  steg: number;
}

const skjemanavn = "dagpenger-rapportering";

export function useAmplitude() {
  const track = getAmplitudeInstance("dekoratoren");

  const trackSkjemaStartet = useCallback(
    (skjemaId: string) => {
      track("skjema startet", {
        skjemanavn,
        skjemaId,
      });
    },
    [track]
  );

  const trackSkjemaFullført = useCallback(
    (skjemaId: string) => {
      track("skjema fullført", {
        skjemanavn,
        skjemaId,
      });
    },
    [track]
  );

  const trackSkjemaInnsendingFeilet = useCallback(
    (skjemaId: string) => {
      track("skjema innsending feilet", {
        skjemanavn,
        skjemaId,
      });
    },
    [track]
  );

  const trackSkjemaSteg = useCallback(
    ({ skjemaId, stegnavn, steg }: ISkjemaSteg) => {
      track("skjema steg fullført", {
        skjemanavn,
        skjemaId,
        stegnavn,
        steg,
      });
    },
    [track]
  );

  return {
    trackSkjemaStartet,
    trackSkjemaFullført,
    trackSkjemaInnsendingFeilet,
    trackSkjemaSteg,
  };
}
