import { formaterPeriodeDato, formaterPeriodeTilUkenummer } from "./dato.utils";
import { parse } from "tinyduration";
import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";

export function periodeSomTimer(periode: string): number | undefined {
  if (!periode) return undefined;

  const parsed = parse(periode);
  const timer = parsed.hours || 0;
  const minutt = parsed.minutes || 0;
  return timer + minutt / 60;
}

export function hentForstePeriodeTekst(rapporteringsperioder: IRapporteringsperiode[]): string {
  const { fraOgMed, tilOgMed } = rapporteringsperioder[0].periode;
  const ukenummer = formaterPeriodeTilUkenummer(fraOgMed, tilOgMed);
  const dato = formaterPeriodeDato(fraOgMed, tilOgMed);

  return `Uke ${ukenummer} (${dato})`;
}
