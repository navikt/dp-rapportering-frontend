import {
  awaitDecoratorData,
  getAmplitudeInstance,
  getCurrentConsent,
} from "@navikt/nav-dekoratoren-moduler";
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

interface ILesMerFilter {
  arbeid: boolean;
  syk: boolean;
  fravaer: boolean;
  utdanning: boolean;
}

interface IFeilmelding {
  tekst: string;
  titleId: string;
  descriptionId: string;
}

const skjemanavn = "dagpenger-rapportering";

export function useAnalytics() {
  const umami =
    typeof window !== "undefined" && getEnv("UMAMI_ID") && window.umami
      ? window.umami.track
      : undefined;
  const amplitude = getAmplitudeInstance("dekoratoren");

  const { locale: språk } = useLocale();

  const trackEvent = useCallback(
    async <T extends object>(event: string, props: T = {} as T) => {
      if (typeof window === "undefined") return;

      await awaitDecoratorData();
      const { consent } = getCurrentConsent();

      if (!consent.analytics) return;

      if (umami) {
        umami(event, {
          skjemanavn,
          språk,
          ...props,
        });
      }

      if (amplitude) {
        amplitude(event, {
          skjemanavn,
          språk,
          ...props,
        });
      }
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

  const trackLesMerFilter = useCallback(
    ({ arbeid, syk, fravaer, utdanning }: ILesMerFilter) => {
      trackEvent("les mer filter", { arbeid, syk, fravaer, utdanning });
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

  const trackForetrukketSprak = useCallback(
    (språk: string) => {
      trackEvent("foretrukket språk", { språk });
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
    trackLesMerFilter,
    trackAlertVist,
    trackModalApnet,
    trackModalLukket,
    trackSprakEndret,
    trackForetrukketSprak,
    trackNavigere,
    trackFeilmelding,
  };
}
