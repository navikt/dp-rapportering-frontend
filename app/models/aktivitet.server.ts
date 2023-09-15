import { getRapporteringOboToken, getSession } from "~/utils/auth.utils.server";
import { getEnv } from "~/utils/env.utils";

export type IAktivitetType = "Arbeid" | "Syk" | "Ferie";

export interface IAktivitet {
  id?: string;
  type: IAktivitetType;
  timer?: string;
  dato: string;
}

export async function lagreAktivitet(
  rapporteringsperiodeId: string,
  aktivitet: IAktivitet,
  request: Request
): Promise<Response> {
  const session = await getSession(request);

  const url = `${getEnv(
    "DP_RAPPORTERING_URL"
  )}/rapporteringsperioder/${rapporteringsperiodeId}/aktivitet`;

  const onBehalfOfToken = await getRapporteringOboToken(session);

  return await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${onBehalfOfToken}`,
    },
    body: JSON.stringify({ ...aktivitet }),
  });
}

export async function sletteAktivitet(
  rapporteringsperiodeId: string,
  aktivitetId: String,
  request: Request
): Promise<Response> {
  const session = await getSession(request);

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
