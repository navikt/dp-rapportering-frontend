import { startUnleash, type Unleash } from "unleash-client";

import { logger } from "~/models/logger.server";
import { isLocalhost } from "~/utils/env.utils";

export const FEATURE_TOGGLES = {
  arbeidssokerstatusNyFlyt: "dp-rapportering-frontend-disableSpm5",
} as const;

let unleashPromise: Promise<Unleash> | null = null;

function hasUnleashConfig() {
  return Boolean(process.env.UNLEASH_SERVER_API_URL && process.env.UNLEASH_SERVER_API_TOKEN);
}

async function getUnleash(): Promise<Unleash> {
  if (!unleashPromise) {
    unleashPromise = startUnleash({
      url: process.env.UNLEASH_SERVER_API_URL!,
      appName: "dp-rapportering-frontend",
      environment: process.env.UNLEASH_SERVER_API_ENV,
      customHeaders: { Authorization: process.env.UNLEASH_SERVER_API_TOKEN! },
    });
  }

  return unleashPromise;
}

export async function isFeatureEnabled(feature: string, fallback = false): Promise<boolean> {
  if (!hasUnleashConfig()) {
    return fallback;
  }

  try {
    return (await getUnleash()).isEnabled(feature, undefined, fallback);
  } catch (error) {
    logger.warn("Kunne ikke hente featureflag fra Unleash", { feature, error });
    unleashPromise = null;
    return fallback;
  }
}

export async function erNyArbeidssokerstatusFlytAktiv(): Promise<boolean> {
  const runtimeEnvironment = process.env.RUNTIME_ENVIRONMENT;
  const skalBrukeUnleashFlagg =
    !isLocalhost &&
    (!runtimeEnvironment ||
      runtimeEnvironment === "development" ||
      runtimeEnvironment === "production");

  return !skalBrukeUnleashFlagg || isFeatureEnabled(FEATURE_TOGGLES.arbeidssokerstatusNyFlyt);
}
