import { audienceDPRapportering, getSession } from "~/utils/auth.utils";
import { getEnv } from "~/utils/env.utils";

export type TAktivitetType = "Arbeid" | "Syk" | "Ferie";

export interface IAktivitet {
  id?: string;
  type: TAktivitetType;
  timer: number;
  dato: string;
}

export async function lagreAktivitet(aktivitet: IAktivitet, request: Request): Promise<IAktivitet> {
  const session = await getSession(request);

  if (!session) {
    throw new Error("Feil ved henting av sessjon");
  }

  const url = `${getEnv("DP_RAPPORTERING_URL")}/aktivitet`;

  const onBehalfOfToken = await session.apiToken(audienceDPRapportering);

  console.log("onBehalfOfToken: ", onBehalfOfToken);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${onBehalfOfToken}`,
    },
    body: JSON.stringify({ aktivitet }),
  });

  if (!response.ok) {
    throw new Response(`Feil ved lagring av aktivitet til ${url}`, {
      status: response.status,
      statusText: response.statusText,
    });
  }

  return await response.json();
}
