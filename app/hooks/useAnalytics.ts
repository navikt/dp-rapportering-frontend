import { getAmplitudeInstance } from "@navikt/nav-dekoratoren-moduler";
import { useCallback } from "react";

import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { DecoratorLocale } from "~/utils/dekoratoren.utils";
import { getEnv } from "~/utils/env.utils";
import { Rapporteringstype } from "~/utils/types";

import { useLocale } from "./useLocale";

interface ISkjemaSteg {
  periode: IRapporteringsperiode;
  stegnavn: string;
  steg: number;
  endring?: boolean;
}

interface INavigere {
  destinasjon: string;
  lenketekst: string;
  linkId: string;
}

interface IAccordion {
  skjemaId: string;
  tekst: string;
  tekstId: string;
}

interface IFeilmelding {
  tekst: string;
  titleId: string;
  descriptionId: string;
}

const skjemanavn = "dagpenger-rapportering";

export function useAnalytics() {
  let track = undefined;

  if (typeof window !== "undefined" && getEnv("UMAMI_ID")) {
    track = window.umami.track;
  } else {
    track = getAmplitudeInstance("dekoratoren");
  }

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
    ({ skjemaId, tekst, tekstId }: IAccordion) => {
      trackEvent("accordion åpnet", { skjemaId, tekst, tekstId });
    },
    [trackEvent],
  );

  const trackAccordionLukket = useCallback(
    ({ skjemaId, tekst, tekstId }: IAccordion) => {
      trackEvent("accordion lukket", { skjemaId, tekst, tekstId });
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

  const trackSprakEndret = useCallback(
    (språk: DecoratorLocale) => {
      trackEvent("språk endret", { språk });
    },
    [trackEvent],
  );

  const trackNavigere = useCallback(
    ({ lenketekst, destinasjon, linkId }: INavigere) => {
      trackEvent("navigere", { lenketekst, destinasjon, linkId });
    },
    [trackEvent],
  );

  const trackFeilmelding = useCallback(
    ({ tekst, titleId, descriptionId }: IFeilmelding) => {
      trackEvent("feilmelding", { tekst, titleId, descriptionId });
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
    trackSprakEndret,
    trackNavigere,
    trackFeilmelding,
  };
}
