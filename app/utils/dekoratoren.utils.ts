import { setBreadcrumbs as setDekoratorenBreadcrumbs } from "@navikt/nav-dekoratoren-moduler";

interface Breadcrumb {
  url: string;
  title: string;
  analyticsTitle?: string;
  handleInApp?: boolean;
}

export enum DecoratorLocale {
  NB = "nb",
  NN = "nn",
  EN = "en",
  SE = "se",
  PL = "pl",
  UK = "uk",
  RU = "ru",
}

const mapToNb = [DecoratorLocale.NN];

const mapToEn = [
  DecoratorLocale.EN,
  DecoratorLocale.SE,
  DecoratorLocale.PL,
  DecoratorLocale.UK,
  DecoratorLocale.RU,
];

export function getLocale(locale: DecoratorLocale | undefined): DecoratorLocale {
  if (!locale) {
    return DecoratorLocale.NB;
  }

  if (mapToNb.includes(locale)) {
    return DecoratorLocale.NB;
  }

  if (mapToEn.includes(locale)) {
    return DecoratorLocale.EN;
  }

  return locale;
}

export type DecoratorLanguageOption =
  | {
      url?: string;
      locale: DecoratorLocale;
      handleInApp: true;
    }
  | {
      url: string;
      locale: DecoratorLocale;
      handleInApp?: false;
    };

export const availableLanguages = [
  {
    locale: DecoratorLocale.NB,
    url: "https://www.nav.no/person/kontakt-oss/nb/",
    handleInApp: true,
  },
  {
    locale: DecoratorLocale.EN,
    url: "https://www.nav.no/person/kontakt-oss/en/",
    handleInApp: true,
  },
];

export const baseUrl: string = "/arbeid/dagpenger/meldekort";

export const defaultBreadcrumbs: Breadcrumb[] = [
  { title: "rapportering-brodsmule-min-side", url: "https://www.nav.no/minside" },
  { title: "rapportering-mine-dagpenger", url: "https://www.nav.no/minside/mine-dagpenger" },
  {
    title: "rapportering-brodsmule-meldekort",
    url: `${baseUrl}/`,
  },
];

export function setBreadcrumbs(breadcrumbs: Breadcrumb[], getAppText: (key: string) => string) {
  if (typeof document !== "undefined") {
    const breadcrumbsWithText = [...defaultBreadcrumbs, ...breadcrumbs].map((breadcrumb) => ({
      ...breadcrumb,
      title: getAppText(breadcrumb.title),
    }));

    setDekoratorenBreadcrumbs(breadcrumbsWithText);
  }
}
