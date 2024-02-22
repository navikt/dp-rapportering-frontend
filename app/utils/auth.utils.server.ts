import { expiresIn, getToken, requestOboToken, validateToken } from "@navikt/oasis";

const fallbackToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

const localToken = process.env.DP_RAPPORTERING_TOKEN ?? fallbackToken;

export function sessionExpiresIn(request: Request) {
  const token = process.env.IS_LOCALHOST === "true" ? localToken : getToken(request);
  if (!token) {
    return 0;
  }

  try {
    return expiresIn(token);
  } catch (e) {
    return 0;
  }
}

const audienceDPRapportering = `${process.env.NAIS_CLUSTER_NAME}:teamdagpenger:dp-rapportering`;

export async function getRapporteringOboToken(request: Request) {
  if (process.env.IS_LOCALHOST === "true") {
    if (sessionExpiresIn(request) <= 0 && process.env.USE_MSW !== "true") {
      throw new Response(null, {
        status: 440,
        statusText: "Localhost sessjon er utløpt!",
      });
    }

    return localToken;
  } else {
    const token = getToken(request);
    if (!token) {
      throw new Response(null, { status: 500, statusText: "Feil ved henting av token" });
    }

    const validation = await validateToken(token);
    if (!validation.ok) {
      throw new Response(null, { status: 500, statusText: "Feil ved validering av token" });
    }

    const obo = await requestOboToken(token, audienceDPRapportering);
    if (!obo.ok) {
      throw new Response(null, { status: 500, statusText: "Feil ved henting av obo token" });
    }
    return obo.token;
  }
}
