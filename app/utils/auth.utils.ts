import { type GetSessionWithOboProvider, makeSession } from "@navikt/dp-auth";
import { idporten } from "@navikt/dp-auth/identity-providers";
import { tokenX, withInMemoryCache } from "@navikt/dp-auth/obo-providers";
import { getEnv } from "./env.utils";

let getSession: GetSessionWithOboProvider;

const audienceDPRapportering = `${getEnv("NAIS_CLUSTER_NAME")}:teamdagpenger:dp-rapportering`;

if (getEnv("AUTH_PROVIDER") == "local") {
  const staticToken =
    getEnv("LOCAL_TOKEN") ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
  getSession = makeSession({
    identityProvider: async () => staticToken,
    oboProvider: getEnv("LOCAL_TOKEN")
      ? tokenX
      : async (token: string, audience: string) => token + audience,
  });
} else {
  getSession = makeSession({
    identityProvider: idporten,
    oboProvider: withInMemoryCache(tokenX),
  });
}
export { getSession, audienceDPRapportering };
