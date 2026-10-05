// @vitest-environment node
import { describe, expect, test, vi } from "vitest";

import { erNyArbeidssokerstatusFlytAktiv } from "~/utils/unleash.server";

vi.mock("~/utils/env.utils", () => ({
  isLocalhost: true,
}));

vi.mock("unleash-client", () => ({
  startUnleash: vi.fn(),
}));

describe("erNyArbeidssokerstatusFlytAktiv", () => {
  test("slår på ny flyt lokalt selv om Unleash ikke er konfigurert", async () => {
    vi.stubEnv("UNLEASH_SERVER_API_URL", "");
    vi.stubEnv("UNLEASH_SERVER_API_TOKEN", "");

    await expect(erNyArbeidssokerstatusFlytAktiv()).resolves.toBe(true);
    vi.unstubAllEnvs();
  });
});
