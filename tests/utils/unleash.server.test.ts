// @vitest-environment node
import { describe, expect, test, vi } from "vitest";

import { erNyArbeidssokerstatusFlytAktiv } from "~/utils/unleash.server";

const { environmentState } = vi.hoisted(() => ({
  environmentState: { isLocalhost: false },
}));
const { startUnleash } = vi.hoisted(() => ({
  startUnleash: vi.fn(),
}));

vi.mock("~/utils/env.utils", () => ({
  get isLocalhost() {
    return environmentState.isLocalhost;
  },
}));

vi.mock("unleash-client", () => ({
  startUnleash,
}));

describe("erNyArbeidssokerstatusFlytAktiv", () => {
  test("slår på ny flyt lokalt uavhengig av miljø og Unleash", async () => {
    environmentState.isLocalhost = true;
    vi.stubEnv("RUNTIME_ENVIRONMENT", "development");
    vi.stubEnv("UNLEASH_SERVER_API_URL", "");
    vi.stubEnv("UNLEASH_SERVER_API_TOKEN", "");

    await expect(erNyArbeidssokerstatusFlytAktiv()).resolves.toBe(true);
    vi.unstubAllEnvs();
  });

  test.each(["development", "production"])(
    "følger Unleash i %s-miljøet når Unleash ikke er konfigurert",
    async (runtimeEnvironment) => {
      environmentState.isLocalhost = false;
      vi.stubEnv("RUNTIME_ENVIRONMENT", runtimeEnvironment);
      vi.stubEnv("UNLEASH_SERVER_API_URL", "");
      vi.stubEnv("UNLEASH_SERVER_API_TOKEN", "");

      await expect(erNyArbeidssokerstatusFlytAktiv()).resolves.toBe(false);
      vi.unstubAllEnvs();
    },
  );

  test.each(["demo", "test"])("slår på ny flyt i %s-miljø uten Unleash", async (env) => {
    environmentState.isLocalhost = false;
    vi.stubEnv("RUNTIME_ENVIRONMENT", env);
    vi.stubEnv("UNLEASH_SERVER_API_URL", "");
    vi.stubEnv("UNLEASH_SERVER_API_TOKEN", "");

    await expect(erNyArbeidssokerstatusFlytAktiv()).resolves.toBe(true);
    vi.unstubAllEnvs();
  });

  test("bruker Unleash-fallback hvis runtime-miljøet ikke er satt", async () => {
    environmentState.isLocalhost = false;
    vi.stubEnv("RUNTIME_ENVIRONMENT", "");
    vi.stubEnv("UNLEASH_SERVER_API_URL", "");
    vi.stubEnv("UNLEASH_SERVER_API_TOKEN", "");

    await expect(erNyArbeidssokerstatusFlytAktiv()).resolves.toBe(false);
    vi.unstubAllEnvs();
  });

  test("slår opp riktig Unleash-toggle", async () => {
    environmentState.isLocalhost = false;
    vi.stubEnv("RUNTIME_ENVIRONMENT", "development");
    vi.stubEnv("UNLEASH_SERVER_API_URL", "https://unleash.test");
    vi.stubEnv("UNLEASH_SERVER_API_TOKEN", "test-token");

    const isEnabled = vi.fn().mockReturnValue(true);
    startUnleash.mockResolvedValue({ isEnabled });

    await expect(erNyArbeidssokerstatusFlytAktiv()).resolves.toBe(true);
    expect(isEnabled).toHaveBeenCalledWith(
      "dp-rapportering-frontend-disableSpm5",
      undefined,
      false,
    );
    vi.unstubAllEnvs();
  });
});
