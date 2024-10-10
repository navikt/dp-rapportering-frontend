import { formaterPeriodeDato, formaterPeriodeTilUkenummer } from "./dato.utils";
import { parse } from "tinyduration";
import type { AktivitetType } from "~/models/aktivitet.server";
import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { type GetAppText } from "~/hooks/useSanity";

export function periodeSomTimer(periode?: string): number | undefined {
  if (!periode) return undefined;

  const parsed = parse(periode);
  const timer = parsed.hours || 0;
  const minutt = parsed.minutes || 0;
  return timer + minutt / 60;
}

export function hentUkeTekst(
  { periode: { fraOgMed, tilOgMed } }: IRapporteringsperiode,
  getAppText: GetAppText
): string {
  return `${getAppText("rapportering-uke")} ${formaterPeriodeTilUkenummer(fraOgMed, tilOgMed)}`;
}

export function hentPeriodeTekst(
  rapporteringsperiode: IRapporteringsperiode,
  getAppText: GetAppText
): string {
  const { fraOgMed, tilOgMed } = rapporteringsperiode.periode;
  const ukenummer = formaterPeriodeTilUkenummer(fraOgMed, tilOgMed);
  const dato = formaterPeriodeDato(fraOgMed, tilOgMed);

  return `${getAppText("rapportering-uke")} ${ukenummer} (${dato})`;
}

export function hentTotaltArbeidstimerTekst(
  rapporteringsperiode: IRapporteringsperiode,
  getAppText: GetAppText
): string {
  const flatMapAktiviteter = rapporteringsperiode.dager.flatMap((d) => d.aktiviteter);
  const filtertAktiviteter = flatMapAktiviteter.filter((aktivitet) => aktivitet.type === "Arbeid");

  const timer = filtertAktiviteter.reduce((accumulator, current) => {
    if (current.timer) {
      return accumulator + (periodeSomTimer(current.timer) ?? 0);
    }
    return accumulator + 1;
  }, 0);

  const formattertTimer = timer.toString().replace(/\./g, ",");

  // TODO: Alltid vis "timer"?
  return `${formattertTimer} ${timer === 1 ? getAppText("rapportering-time") : getAppText("rapportering-timer")}`;
}

export function hentTotaltFravaerTekstMedType(
  rapporteringsperiode: IRapporteringsperiode,
  aktivitetType: AktivitetType,
  getAppText: GetAppText
): string {
  const flatMapAktiviteter = rapporteringsperiode.dager.flatMap((d) => d.aktiviteter);
  const filtertAktiviteter = flatMapAktiviteter.filter(
    (aktivitet) => aktivitet.type === aktivitetType
  );

  return `${filtertAktiviteter.length} ${filtertAktiviteter.length === 1 ? getAppText("rapportering-dag") : getAppText("rapportering-dager")}`;
}

export function harAktiviteter(periode: IRapporteringsperiode): boolean {
  return periode.dager.some((dag) => dag.aktiviteter.length > 0);
}
