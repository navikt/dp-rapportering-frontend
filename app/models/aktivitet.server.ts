import { getRapporteringOboToken, getSession } from "~/utils/auth.utils.server";
import { getEnv } from "~/utils/env.utils";

export type TAktivitetType = "Arbeid" | "Syk" | "Ferie";

export interface IAktivitet {
  id?: string;
  type: TAktivitetType;
  timer?: string;
  dato: string;
}

export async function lagreAktivitet(
  rapporteringsperiodeId: string,
  aktivitet: IAktivitet,
  request: Request
): Promise<IAktivitet> {
  const session = await getSession(request);

  if (!session) {
    throw new Error("Feil ved henting av sessjon");
  }

  const url = `${getEnv(
    "DP_RAPPORTERING_URL"
  )}/rapporteringsperioder/${rapporteringsperiodeId}/aktivitet`;

  const onBehalfOfToken = await getRapporteringOboToken(session);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${onBehalfOfToken}`,
    },
    body: JSON.stringify({ ...aktivitet }),
  });

  if (!response.ok) {
    throw new Response(`Feil ved lagring av aktivitet til ${url}`, {
      status: response.status,
      statusText: response.statusText,
    });
  }

  return await response.json();
}

export async function sletteAktivitet(
  rapporteringsperiodeId: string,
  aktivitetId: String,
  request: Request
): Promise<Response> {
  const session = await getSession(request);

  if (!session) {
    throw new Error("Feil ved henting av sessjon");
  }

  const url = `${getEnv(
    "DP_RAPPORTERING_URL"
  )}/rapporteringsperioder/${rapporteringsperiodeId}/aktivitet/${aktivitetId}`;

  const onBehalfOfToken = await getRapporteringOboToken(session);

  return await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${onBehalfOfToken}`,
    },
  });
}
