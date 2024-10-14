import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});

vi.stubEnv("DP_RAPPORTERING_URL", "https://dp-rapportering.intern.dev.nav.no");

if (typeof window !== "undefined") {
  window.env = window.env || {};

  window.env.DP_RAPPORTERING_URL = "https://dp-rapportering.intern.dev.nav.no";
}

vi.mock("~/hooks/useSanity", () => ({
  useSanity: () => ({
    getAppText: (key: string) => key,
    getLink: (key: string) => ({ linkText: key, href: key }),
    getRichText: (key: string) => key,
  }),
}));

vi.mock("@portabletext/react", () => ({
  PortableText: ({ value }: { value: string }) => value,
}));
