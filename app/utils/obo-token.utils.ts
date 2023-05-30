import type { SessionWithOboProvider } from "@navikt/dp-auth/index/";
import { audienceDPRapportering } from "./auth.utils";
import { getEnv } from "./env.utils";

export async function getRapporteringOboToken(session: SessionWithOboProvider) {
  if (getEnv("IS_LOCALHOST") === "true" && getEnv("DP_RAPPORTERING_TOKEN")) {
    return getEnv("DP_RAPPORTERING_TOKEN");
  } else {
    const token = await session.apiToken(audienceDPRapportering);
    return token;
  }
}
