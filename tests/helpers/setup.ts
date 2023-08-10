import { vi, expect, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import matchers from "@testing-library/jest-dom/matchers";

// extends Vitest's expect method with methods from react-testing-library
expect.extend(matchers);

// runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});

vi.stubEnv("DP_BEHANDLING_URL", "https://dp-behandling.intern.dev.nav.no");
vi.stubEnv("DP_RAPPORTERING_URL", "https://dp-rapportering.intern.dev.nav.no");

if (typeof window !== "undefined") {
  window.env = window.env || {};

  window.env.DP_RAPPORTERING_URL = "https://dp-rapportering.intern.dev.nav.no";
}
