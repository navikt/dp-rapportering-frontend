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
