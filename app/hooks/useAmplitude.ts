import { useLocale } from "./useLocale";
import { getAmplitudeInstance } from "@navikt/nav-dekoratoren-moduler";
import { useCallback } from "react";
import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { Rapporteringstype } from "~/utils/types";

interface ISkjemaSteg {
  periode: IRapporteringsperiode;
  stegnavn: string;
  steg: number;
  endring?: boolean;
}

const skjemanavn = "dagpenger-rapportering";

export function useAmplitude() {
  const track = getAmplitudeInstance("dekoratoren");
  const { locale: språk } = useLocale();

  const trackEvent = useCallback(
    <T extends object>(event: string, props: T = {} as T) => {
      track(event, {
        skjemanavn,
        språk,
        ...props,
      });
    },
    [track, språk]
  );
  const trackSkjemaStartet = useCallback(
    (skjemaId: string, endring = false) => {
      trackEvent("skjema startet", { skjemaId, endring });
    },
    [trackEvent]
  );

  const trackSkjemaFullført = useCallback(
    (skjemaId: string, rapporteringstype: Rapporteringstype | null, endring = false) =>
      trackEvent("skjema fullført", { skjemaId, rapporteringstype, endring }),
    [trackEvent]
  );

  const trackSkjemaInnsendingFeilet = useCallback(
    (skjemaId: string, rapporteringstype: Rapporteringstype | null, endring = false) =>
      trackEvent("skjema innsending feilet", { skjemaId, rapporteringstype, endring }),
    [trackEvent]
  );

  const trackSkjemaSteg = useCallback(
    ({ periode: { id, rapporteringstype }, stegnavn, steg, endring = false }: ISkjemaSteg) =>
      trackEvent("skjemasteg fullført", {
        skjemaId: id,
        stegnavn,
        steg,
        rapporteringstype,
        endring,
      }),
    [trackEvent]
  );

  return {
    trackSkjemaStartet,
    trackSkjemaFullført,
    trackSkjemaInnsendingFeilet,
    trackSkjemaSteg,
  };
}
