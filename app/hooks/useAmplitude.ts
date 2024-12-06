import { getAmplitudeInstance } from "@navikt/nav-dekoratoren-moduler";
import { useCallback } from "react";

import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { Rapporteringstype } from "~/utils/types";

import { useLocale } from "./useLocale";

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
    [track, språk],
  );

  const trackSkjemaStartet = useCallback(
    (skjemaId: string, endring = false) => {
      trackEvent("skjema startet", { skjemaId, endring });
    },
    [trackEvent],
  );

  const trackSkjemaFullført = useCallback(
    (skjemaId: string, rapporteringstype: Rapporteringstype | null, endring = false) =>
      trackEvent("skjema fullført", { skjemaId, rapporteringstype, endring }),
    [trackEvent],
  );

  const trackSkjemaInnsendingFeilet = useCallback(
    (skjemaId: string, rapporteringstype: Rapporteringstype | null, endring = false) =>
      trackEvent("skjema innsending feilet", { skjemaId, rapporteringstype, endring }),
    [trackEvent],
  );

  const trackSkjemaSteg = useCallback(
    ({ periode: { id, rapporteringstype }, stegnavn, steg, endring = false }: ISkjemaSteg) =>
      trackEvent("skjema steg fullført", {
        skjemaId: id,
        stegnavn,
        steg,
        rapporteringstype,
        endring,
      }),
    [trackEvent],
  );

  const trackAccordionApnet = useCallback(
    (skjemaId: string) => {
      trackEvent("accordion åpnet", { skjemaId });
    },
    [trackEvent],
  );

  const trackAccordionLukket = useCallback(
    (skjemaId: string) => {
      trackEvent("accordion lukket", { skjemaId });
    },
    [trackEvent],
  );

  const trackAlertVist = useCallback(
    (skjemaId: string) => {
      trackEvent("alert vist", { skjemaId });
    },
    [trackEvent],
  );

  const trackModalApnet = useCallback(
    (skjemaId: string) => {
      trackEvent("modal åpnet", { skjemaId });
    },
    [trackEvent],
  );

  const trackModalLukket = useCallback(
    (skjemaId: string) => {
      trackEvent("modal lukket", { skjemaId });
    },
    [trackEvent],
  );

  return {
    trackSkjemaStartet,
    trackSkjemaFullført,
    trackSkjemaInnsendingFeilet,
    trackSkjemaSteg,
    trackAccordionApnet,
    trackAccordionLukket,
    trackAlertVist,
    trackModalApnet,
    trackModalLukket,
  };
}
