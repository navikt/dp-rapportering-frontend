import { getAmplitudeInstance } from "@navikt/nav-dekoratoren-moduler";
import { useCallback } from "react";

import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { DecoratorLocale } from "~/utils/dekoratoren.utils";
import { getEnv, isLocalOrDemo } from "~/utils/env.utils";
import { Rapporteringstype } from "~/utils/types";

import { useLocale } from "./useLocale";

interface ISkjemaSteg {
  periode: IRapporteringsperiode;
  stegnavn: string;
  steg: number;
  endring?: boolean;
  sesjonId?: string;
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
  const umami = typeof window !== "undefined" && getEnv("UMAMI_ID") ? window.umami.track : () => {};
  const amplitude = getAmplitudeInstance("dekoratoren");

  const { locale: språk } = useLocale();

  const trackEvent = useCallback(
    <T extends object>(event: string, props: T = {} as T) => {
      if (isLocalOrDemo) {
        umami(event, {
          skjemanavn,
          språk,
          ...props,
        });
      }

      amplitude(event, {
        skjemanavn,
        språk,
        ...props,
      });
    },
    [umami, amplitude, språk],
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

  const trackSkjemaStegStartet = useCallback(
    ({
      periode: { id, rapporteringstype },
      stegnavn,
      steg,
      endring = false,
      sesjonId,
    }: ISkjemaSteg) => {
      return trackEvent("skjema steg startet", {
        skjemaId: id,
        stegnavn,
        steg,
        rapporteringstype,
        endring,
        sesjonId,
      });
    },
    [trackEvent],
  );

  const trackSkjemaStegFullført = useCallback(
    ({
      periode: { id, rapporteringstype },
      stegnavn,
      steg,
      endring = false,
      sesjonId,
    }: ISkjemaSteg) => {
      return trackEvent("skjema steg fullført", {
        skjemaId: id,
        stegnavn,
        steg,
        rapporteringstype,
        endring,
        sesjonId,
      });
    },
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
    trackSkjemaStegStartet,
    trackSkjemaStegFullført,
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
