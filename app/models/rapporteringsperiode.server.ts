import { getRapporteringOboToken, getSession } from "~/utils/auth.utils.server";
import { getEnv } from "~/utils/env.utils";
import type { IAktivitet, TAktivitetType } from "./aktivitet.server";

export interface IRapporteringsperiode {
  id: string;
  fraOgMed: string;
  tilOgMed: string;
  status: string;
  dager: IRapporteringsperiodeDag[];
}

interface IRapporteringsperiodeDag {
  dagIndex: number;
  dato: string;
  muligeAktiviteter: TAktivitetType[];
  aktiviteter: IAktivitet[];
}

export async function hentGjeldendePeriode(request: Request): Promise<Response> {
  const url = `${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder/gjeldende`;
  const session = await getSession(request);
  const onBehalfOfToken = await getRapporteringOboToken(session);

  return await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${onBehalfOfToken}`,
    },
  });
}

export async function hentAllePerioder(request: Request): Promise<Response> {
  const url = `${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder`;
  const session = await getSession(request);
  const onBehalfOfToken = await getRapporteringOboToken(session);

  return await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${onBehalfOfToken}`,
    },
  });
}

export async function godkjennPeriode(id: string, request: Request): Promise<Response> {
  const url = `${getEnv("DP_RAPPORTERING_URL")}/rapporteringsperioder/${id}/godkjenn`;
  const session = await getSession(request);
  const onBehalfOfToken = await getRapporteringOboToken(session);

  return await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${onBehalfOfToken}`,
    },
  });
}
