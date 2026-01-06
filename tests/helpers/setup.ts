import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll, vi } from "vitest";

import { DecoratorLocale } from "~/utils/dekoratoren.utils";

beforeAll(() => {
  // Sikre at alle Web APIs kommer fra samme realm
  globalThis.Request = Request as typeof globalThis.Request;
  globalThis.FormData = FormData as typeof globalThis.FormData;
});

// runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});

vi.stubEnv("DP_RAPPORTERING_URL", "https://dp-rapportering.intern.dev.nav.no");

if (typeof window !== "undefined") {
  window.env = window.env || {};

  window.env.DP_RAPPORTERING_URL = "https://dp-rapportering.intern.dev.nav.no";
}

vi.mock("@navikt/nav-dekoratoren-moduler", async () => {
  const actualModule = await import("@navikt/nav-dekoratoren-moduler");
  return {
    ...actualModule,
    getAnalyticsInstance: vi.fn(),
    setBreadcrumbs: vi.fn(),
  };
});

vi.mock("~/hooks/useLocale", () => ({
  locale: DecoratorLocale.NB,
}));

vi.mock("~/hooks/useAnalytics", () => ({
  useAnalytics: () => ({
    trackSkjemaStartet: vi.fn(),
    trackSkjemaFullført: vi.fn(),
    trackSkjemaInnsendingFeilet: vi.fn(),
    trackSkjemaStegStartet: vi.fn(),
    trackSkjemaStegFullført: vi.fn(),
    trackAccordionApnet: vi.fn(),
    trackAccordionLukket: vi.fn(),
    trackLesMerFilter: vi.fn(),
    trackAlertVist: vi.fn(),
    trackModalApnet: vi.fn(),
    trackModalLukket: vi.fn(),
    trackSprakEndret: vi.fn(),
    trackForetrukketSprak: vi.fn(),
    trackNavigere: vi.fn(),
    trackFeilmelding: vi.fn(),
  }),
}));

vi.mock("~/hooks/useSanity", () => ({
  useSanity: () => ({
    getAppText: (key: string) => key,
    getLink: (key: string) => ({ linkText: key, href: key }),
    getRichText: (key: string) => key,
    getMessages: () => [],
  }),
}));

vi.mock("@portabletext/react", () => ({
  PortableText: ({ value }: { value: string }) => value,
}));
