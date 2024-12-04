import { parse } from "tinyduration";

import { type GetAppText } from "~/hooks/useSanity";
import {
  IRapporteringsperiode,
  IRapporteringsperiodeDag,
} from "~/models/rapporteringsperiode.server";

import { AktivitetType, IAktivitet } from "./aktivitettype.utils";
import { formaterPeriodeDato, formaterPeriodeTilUkenummer } from "./dato.utils";
import { IRapporteringsperiodeStatus } from "./types";

export function periodeSomTimer(periode?: string): number | undefined {
  if (!periode) return undefined;

  periode = periode.replace(/\s/g, "");

  const parsed = parse(periode);
  const timer = parsed.hours || 0;
  const minutt = parsed.minutes || 0;
  return timer + minutt / 60;
}

export function hentUkeTekst(
  { periode: { fraOgMed, tilOgMed } }: IRapporteringsperiode,
  getAppText: GetAppText,
): string {
  return `${getAppText("rapportering-uke")} ${formaterPeriodeTilUkenummer(fraOgMed, tilOgMed)}`;
}

export function hentPeriodeTekst(
  rapporteringsperiode: IRapporteringsperiode,
  getAppText: GetAppText,
): string {
  const { fraOgMed, tilOgMed } = rapporteringsperiode.periode;
  const ukenummer = formaterPeriodeTilUkenummer(fraOgMed, tilOgMed);
  const dato = formaterPeriodeDato(fraOgMed, tilOgMed);

  return `${getAppText("rapportering-uke")} ${ukenummer} (${dato})`;
}

export function hentTotaltArbeidstimer(rapporteringsperiode: IRapporteringsperiode): number {
  const flatMapAktiviteter = rapporteringsperiode.dager.flatMap((d) => d.aktiviteter);
  const filtertAktiviteter = flatMapAktiviteter.filter((aktivitet) => aktivitet.type === "Arbeid");

  const timer = filtertAktiviteter.reduce((accumulator, current) => {
    if (current.timer) {
      return accumulator + (periodeSomTimer(current.timer) ?? 0);
    }
    return accumulator + 1;
  }, 0);

  return timer;
}

export function hentTotaltArbeidstimerTekst(
  rapporteringsperiode: IRapporteringsperiode,
  getAppText: GetAppText,
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

export function hentTotaltDagerMedAktivitetstype(
  rapporteringsperiode: IRapporteringsperiode,
  aktivitetType: AktivitetType,
): number {
  const flatMapAktiviteter = rapporteringsperiode.dager.flatMap((d) => d.aktiviteter);
  const filtertAktiviteter = flatMapAktiviteter.filter(
    (aktivitet) => aktivitet.type === aktivitetType,
  );

  return filtertAktiviteter.length;
}

export function hentTotaltFravaerTekstMedType(
  rapporteringsperiode: IRapporteringsperiode,
  aktivitetType: AktivitetType,
  getAppText: GetAppText,
): string {
  const flatMapAktiviteter = rapporteringsperiode.dager.flatMap((d) => d.aktiviteter);
  const filtertAktiviteter = flatMapAktiviteter.filter(
    (aktivitet) => aktivitet.type === aktivitetType,
  );

  return `${filtertAktiviteter.length} ${filtertAktiviteter.length === 1 ? getAppText("rapportering-dag") : getAppText("rapportering-dager")}`;
}

export function harAktiviteter(periode: IRapporteringsperiode): boolean {
  return periode.dager.some((dag) => dag.aktiviteter.length > 0);
}

export function perioderSomKanSendes(perioder: IRapporteringsperiode[]): IRapporteringsperiode[] {
  return perioder.filter((periode) => periode.kanSendes);
}

export function kanSendes(periode: IRapporteringsperiode): boolean {
  return periode.status === IRapporteringsperiodeStatus.TilUtfylling && periode.kanSendes;
}

export function sorterAktiviteter(aktivitet1: IAktivitet, aktivitet2: IAktivitet): number {
  if (aktivitet1.timer && aktivitet2.timer) {
    return aktivitet1.timer.localeCompare(aktivitet2.timer);
  }

  return aktivitet1.type.localeCompare(aktivitet2.type);
}

export function erAktivitetenLik(aktivitet: IAktivitet, originalAktivitet: IAktivitet) {
  if (aktivitet.type !== originalAktivitet.type) {
    return false;
  }

  if (aktivitet.timer !== originalAktivitet.timer) {
    return false;
  }

  return true;
}

export function erAktiviteteneLike(
  aktiviteter: IAktivitet[],
  originaleAktiviteter: IAktivitet[],
): boolean {
  if (aktiviteter.length !== originaleAktiviteter.length) {
    return false;
  }

  const sorterteAktiviteter = aktiviteter.sort(sorterAktiviteter);
  const sorterteOriginaleAktiviteter = originaleAktiviteter.sort(sorterAktiviteter);

  if (JSON.stringify(sorterteAktiviteter) !== JSON.stringify(sorterteOriginaleAktiviteter)) {
    return false;
  }

  return true;
}

export function erDageneLike(
  dag: IRapporteringsperiodeDag,
  originalDag: IRapporteringsperiodeDag,
): boolean {
  if (dag.dato !== originalDag.dato) {
    return false;
  }

  if (dag.aktiviteter.length !== originalDag.aktiviteter.length) {
    return false;
  }

  if (!erAktiviteteneLike(dag.aktiviteter, originalDag.aktiviteter)) {
    return false;
  }

  return true;
}

export function erPeriodeneLike(
  periode: IRapporteringsperiode,
  originalPeriode: IRapporteringsperiode,
): boolean {
  if (
    periode.periode.fraOgMed !== originalPeriode.periode.fraOgMed ||
    periode.periode.tilOgMed !== originalPeriode.periode.tilOgMed
  ) {
    return false;
  }

  if (!periode.dager.every((dag, index) => erDageneLike(dag, originalPeriode.dager[index]))) {
    return false;
  }

  return true;
}
