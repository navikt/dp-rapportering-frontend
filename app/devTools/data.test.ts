import {
  lagPeriodeDato,
  lagRapporteringsperiodeMedArbeidAktivitet,
  lagRapporteringsperiodeMedArbeidSykOgFravaer,
  lagRapporteringsperioderUtenAktivitet,
} from "./data";
import { describe, expect, test } from "vitest";

describe("Data functions", () => {
  test("genererer rapporteringsperioder uten aktiviteter", () => {
    const antallPerioder = 2;
    const status = "Innsendt";

    const perioder = lagRapporteringsperioderUtenAktivitet(antallPerioder, status);

    expect(perioder.length).toBe(antallPerioder);

    perioder.forEach((periode) => {
      expect(periode.dager.length).toBe(14);
      expect(periode.dager.every((dag) => dag.aktiviteter.length === 0)).toBe(true);
    });
  });

  test.only("genererer rapporteringsperioder med 50% arbeid aktiviteter", () => {
    const antallPerioder = 3;
    const status = "Innsendt";

    const perioder = lagRapporteringsperiodeMedArbeidAktivitet(antallPerioder, status);

    expect(perioder.length).toBe(antallPerioder);

    expect(
      perioder.every(
        (periode) =>
          periode.dager.filter((dag) =>
            dag.aktiviteter.some((aktivitet) => aktivitet.type === "Arbeid")
          ).length === 5
      )
    ).toBe(true);
  });

  test.only("generer periode med arbeid, syk og fravær aktiviteter", () => {
    const antallPerioder = 2;
    const status = "Innsendt";
    const perioder = lagRapporteringsperiodeMedArbeidSykOgFravaer(antallPerioder, status);

    expect(perioder.length).toBe(2);

    expect(
      perioder.every((periode) =>
        periode.dager.some((dag) =>
          dag.aktiviteter.some(
            (aktivitet) =>
              aktivitet.type === "Arbeid" ||
              aktivitet.type === "Syk" ||
              aktivitet.type === "Fravaer"
          )
        )
      )
    ).toBe(true);
  });
});

describe("lagPeriodeDato", () => {
  test("should return correct dates for week number and year", () => {
    const weekNumber = 18;
    const year = 2023;
    const { fraOgMed, tilOgMed } = lagPeriodeDato(weekNumber, year);

    expect(fraOgMed).toBe("2023-05-01");
    expect(tilOgMed).toBe("2023-05-14");
  });

  test("should handle week number at the start of the year", () => {
    const weekNumber = 1;
    const year = 2023;
    const { fraOgMed, tilOgMed } = lagPeriodeDato(weekNumber, year);

    expect(fraOgMed).toBe("2023-01-02");
    expect(tilOgMed).toBe("2023-01-15");
  });
});
