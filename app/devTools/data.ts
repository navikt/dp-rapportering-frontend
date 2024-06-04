import { addDays, addWeeks, format, getWeek, getYear, startOfWeek } from "date-fns";
import { pipe, times } from "remeda";
import { uuidv7 as uuid } from "uuidv7";
import { AktivitetType, IAktivitet } from "~/models/aktivitet.server";
import {
  IRapporteringsperiode,
  IRapporteringsperiodeDag,
} from "~/models/rapporteringsperiode.server";

interface Periode {
  fraOgMed: string;
  tilOgMed: string;
}

function lagAktivitet(type: AktivitetType): IAktivitet {
  return {
    id: uuid(),
    type,
    timer: type === "Arbeid" ? "PT7H30M" : undefined,
  };
}

const lagDagMedAktiviteter = (
  dagIndex: number,
  aktiviteter: IAktivitet[] = []
): IRapporteringsperiodeDag => ({
  dagIndex,
  dato: new Date(2023, 4, 1 + dagIndex).toISOString().split("T")[0],
  aktiviteter,
});

const lagRapporteringsperiodeMedTidslinje = (
  status: "Innsendt",
  tidslinje: Map<number, IAktivitet>,
  index = 0
): IRapporteringsperiode => {
  const currentYear = getYear(new Date());
  const week = getWeek(new Date()) - (index + 2) * 2;

  const { fraOgMed, tilOgMed } = lagPeriodeDato(week, currentYear);

  return {
    id: uuid(),
    status,
    periode: {
      fraOgMed,
      tilOgMed,
    },
    kanSendesFra: tilOgMed,
    kanSendes: true,
    kanKorrigeres: true,
    dager: times(14, (i) => {
      const aktivitet = tidslinje.get(i);
      return lagDagMedAktiviteter(i, aktivitet ? [aktivitet] : []);
    }),
  };
};

export const lagRapporteringsperioderUtenAktivitet = (
  antall: number,
  status: "Innsendt"
): IRapporteringsperiode[] =>
  times(antall, (index) => {
    return lagRapporteringsperiodeMedTidslinje(status, new Map(), index);
  });

export const lagInnsendteRapporteringsperioderUtenAktivitet = (antall: number) => {
  return lagRapporteringsperioderUtenAktivitet(antall, "Innsendt");
};

export const lagRapporteringsperiodeMedArbeidAktivitet = (
  antall: number,
  status: "Innsendt"
): IRapporteringsperiode[] => {
  const dagerMedArbeid = [0, 2, 4, 8, 10];

  const aktivitetstidslinje = new Map<number, IAktivitet>(
    dagerMedArbeid.map((dag) => [dag, { id: uuid(), type: "Arbeid", timer: "PT7H30M" }])
  );
  return times(antall, (index) => {
    return lagRapporteringsperiodeMedTidslinje(status, aktivitetstidslinje, index);
  });
};

export const lagInnsendteRapporteringsperiodeMedArbeidAktivitet = (
  antall: number
): IRapporteringsperiode[] => {
  return lagRapporteringsperiodeMedArbeidAktivitet(antall, "Innsendt");
};

export function lagRapporteringsperiodeMedArbeidSykOgFravaer(
  antall: number,
  status: "Innsendt"
): IRapporteringsperiode[] {
  const workDays = [0, 2];
  const sickDays = [1, 3];
  const leaveDays = [5, 10];

  const activityMap = pipe([...workDays, ...sickDays, ...leaveDays], (days) =>
    days.reduce((map, day) => {
      const type = workDays.includes(day) ? "Arbeid" : sickDays.includes(day) ? "Syk" : "Fravaer";
      return map.set(day, lagAktivitet(type));
    }, new Map<number, IAktivitet>())
  );

  return times(antall, (index) => {
    return lagRapporteringsperiodeMedTidslinje(status, activityMap, index);
  });
}

export function lagInnsendteRapporteringsperiodeMedArbeidSykOgFravaer(
  antall: number
): IRapporteringsperiode[] {
  return lagRapporteringsperiodeMedArbeidSykOgFravaer(antall, "Innsendt");
}

export const perioderUtenAktiviteter = (periode: IRapporteringsperiode) =>
  periode.dager.every((dag) => dag.aktiviteter.length === 0);

export const perioderMedKunArbeid = (periode: IRapporteringsperiode) => {
  return periode.dager.every((dag) =>
    dag.aktiviteter.every((aktivitet) => aktivitet.type === "Arbeid")
  );
};

export const perioderMedAktiviteter = (periode: IRapporteringsperiode) =>
  periode.dager.some((dag) => dag.aktiviteter.length > 0);

export const perioderMedKunArbeidAktivitet = (periode: IRapporteringsperiode) =>
  periode.dager.every((dag) => dag.aktiviteter.every((aktivitet) => aktivitet.type === "Arbeid"));

export const perioderMedArbeidSykFravaer = (periode: IRapporteringsperiode) =>
  periode.dager.every((dag) =>
    dag.aktiviteter.every((aktivitet) => ["Arbeid", "Syk", "Fravaer"].includes(aktivitet.type))
  );

export function lagPeriodeDato(weekNumber: number, year: number): Periode {
  const firstDayOfYear = new Date(Date.UTC(year, 0, 1));
  const weekStart = startOfWeek(firstDayOfYear, { weekStartsOn: 1 });

  const targetDate = addWeeks(weekStart, weekNumber);

  const fraOgMed = format(targetDate, "yyyy-MM-dd");
  const tilOgMed = format(addDays(targetDate, 13), "yyyy-MM-dd");

  return {
    fraOgMed,
    tilOgMed,
  };
}
