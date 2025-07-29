import {
  awaitDecoratorData,
  getAnalyticsInstance,
  getCurrentConsent,
} from "@navikt/nav-dekoratoren-moduler";
import { useCallback } from "react";

import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { hentData, redactId } from "~/utils/analytics";
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

interface IModal {
  skjemaId: string;
  modalId: string;
  sesjonId: string;
}

interface ILukkModal extends IModal {
  knapp: string;
  antallAktiviteter?: number;
}

const skjemanavn = "dagpenger-rapportering";

export function useAnalytics() {
  const amplitude = getAnalyticsInstance(skjemanavn);
  const umami =
    typeof window !== "undefined" && getEnv("UMAMI_ID") && window.umami
      ? window.umami.track
      : undefined;

  const { locale: språk } = useLocale();

  const trackEvent = useCallback(
    async <T extends object>(event: string, props: T = {} as T) => {
      if (typeof window === "undefined") return;

      await awaitDecoratorData();
      const { consent } = getCurrentConsent();

      if (!consent.analytics) return;

      const data = await hentData({ props, språk, skjemanavn });

      if (umami) {
        // @ts-expect-error - Umami is not typed correctly
        umami((umamiProps) => {
          return {
            name: event,
            ...umamiProps,
            referrer: redactId(umamiProps.referrer),
            url: redactId(window.location.pathname),
            data,
          };
        });
      }

      if (amplitude) {
        amplitude(event, data);
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
    ({ skjemaId, modalId, sesjonId }: IModal) => {
      trackEvent("modal åpnet", { skjemaId, modalId, sesjonId });
    },
    [trackEvent],
  );

  const trackModalLukket = useCallback(
    ({ skjemaId, modalId, sesjonId, knapp, antallAktiviteter }: ILukkModal) => {
      trackEvent("modal lukket", { skjemaId, modalId, sesjonId, knapp, antallAktiviteter });
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

  const trackBesok = useCallback(
    ({ tekst, titleId, descriptionId }: IFeilmelding) => {
      trackEvent("besøk", { tekst, titleId, descriptionId });
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
    trackBesok,
  };
}
