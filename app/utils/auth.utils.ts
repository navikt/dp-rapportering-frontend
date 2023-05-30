import { makeSession, type GetSessionWithOboProvider, type SessionWithOboProvider } from "@navikt/dp-auth";
import { idporten } from "@navikt/dp-auth/identity-providers";
import { tokenX, withInMemoryCache } from "@navikt/dp-auth/obo-providers";
import { getEnv } from "./env.utils";

export let getSession: GetSessionWithOboProvider;

if (getEnv("IS_LOCALHOST") === "true") {
  getSession = makeSession({
    identityProvider: async () => getEnv("DP_RAPPORTERING_TOKEN"),
    oboProvider: tokenX,
  });
} else {
  getSession = makeSession({
    identityProvider: idporten,
    oboProvider: withInMemoryCache(tokenX),
  });
}

export async function getRapporteringOboToken(session: SessionWithOboProvider) {
  if (getEnv("IS_LOCALHOST") === "true" && getEnv("DP_RAPPORTERING_TOKEN")) {
    return getEnv("DP_RAPPORTERING_TOKEN");
  } else {
    const audienceDPRapportering = `${getEnv("NAIS_CLUSTER_NAME")}:teamdagpenger:dp-rapportering`;
    return session.apiToken(audienceDPRapportering);
  }
}
