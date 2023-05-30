import {
  makeSession,
  type GetSessionWithOboProvider,
  type SessionWithOboProvider,
} from "@navikt/dp-auth";
import { idporten } from "@navikt/dp-auth/identity-providers";
import { tokenX, withInMemoryCache } from "@navikt/dp-auth/obo-providers";
import { getEnv } from "./env.utils";

const fallbackToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

export let getSession: GetSessionWithOboProvider;

if (process.env.IS_LOCALHOST === "true") {
  getSession = makeSession({
    identityProvider: async () => process.env.DP_RAPPORTERING_TOKEN || fallbackToken,
    oboProvider: process.env.DP_RAPPORTERING_TOKEN
      ? tokenX
      : async (token: string, audience: string) => token + audience,
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
