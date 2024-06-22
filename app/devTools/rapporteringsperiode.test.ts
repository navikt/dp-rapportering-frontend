import {
  finnForrigePeriodeDato,
  lagPeriodeDatoFor,
  lagRapporteringsperiode,
} from "./rapporteringsperiode";
import { describe, expect, test } from "vitest";

describe("lagRapporteringsperiode", () => {
  test("skal generere en periode med 14 dager", () => {
    const fraOgMed = "2024-06-08";
    const tilOgMed = "2024-06-21";

    const rapporteringsperiode = lagRapporteringsperiode(fraOgMed, tilOgMed);

    expect(rapporteringsperiode.dager).toHaveLength(14);
    rapporteringsperiode.dager.forEach((dag, index) => {
      const forventetDato = new Date(fraOgMed);
      forventetDato.setDate(forventetDato.getDate() + index);
      expect(dag.dato).toBe(forventetDato.toISOString().split("T")[0]);
    });
  });

  test("skal ha riktig kanSendesFra-dato", () => {
    const fraOgMed = "2024-06-08";
    const tilOgMed = "2024-06-21";

    const rapporteringsperiode = lagRapporteringsperiode(fraOgMed, tilOgMed);

    const expectedKanSendesFra = new Date(tilOgMed);
    expectedKanSendesFra.setDate(expectedKanSendesFra.getDate() - 1);

    expect(rapporteringsperiode.kanSendesFra).toBe(
      expectedKanSendesFra.toISOString().split("T")[0]
    );
  });

  test("skal generere unike id-er for hver periode", () => {
    const fraOgMed1 = "2024-09-01";
    const tilOgMed1 = "2024-09-14";

    const fraOgMed2 = "2024-10-01";
    const tilOgMed2 = "2024-10-14";

    const rapporteringsperiode1 = lagRapporteringsperiode(fraOgMed1, tilOgMed1);
    const rapporteringsperiode2 = lagRapporteringsperiode(fraOgMed2, tilOgMed2);

    expect(rapporteringsperiode1.id).not.toBe(rapporteringsperiode2.id);
  });
});

describe("lagPeriodeDato", () => {
  test("oppretter riktig datoer for gitt uke og år", () => {
    const ukeNummer = 14;
    const år = 2024;

    const { fraOgMed, tilOgMed } = lagPeriodeDatoFor(ukeNummer, år);

    expect(fraOgMed).toBe("2024-04-01");
    expect(tilOgMed).toBe("2024-04-14");
  });
});

describe("finnNestePeriodeDato", () => {
  test("skal beregne riktige periodedatoer", () => {
    const result = finnForrigePeriodeDato("2024-06-10");

    expect(result.fraOgMed).toBe("2024-05-27");
    expect(result.tilOgMed).toBe("2024-06-09");
  });

  test("skal beregne riktige periodedatoer", () => {
    const result = finnForrigePeriodeDato("2024-12-31");

    expect(result.fraOgMed).toBe("2024-12-17");
    expect(result.tilOgMed).toBe("2024-12-30");
  });

  test("skal håndtere datooverganger korrekt", () => {
    const result = finnForrigePeriodeDato("2024-01-01");

    expect(result.fraOgMed).toBe("2023-12-18");
    expect(result.tilOgMed).toBe("2023-12-31");
  });
});
