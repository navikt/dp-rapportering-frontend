import { beregnForrigePeriodeDato, lagPeriodeDatoFor } from "./periodedato";
import { describe, expect, test } from "vitest";

describe("lagPeriodeDato", () => {
  test("oppretter riktig datoer for gitt uke og år", () => {
    const ukeNummer = 14;
    const år = 2024;

    const { fraOgMed, tilOgMed } = lagPeriodeDatoFor(ukeNummer, år);

    expect(fraOgMed).toBe("2024-04-01");
    expect(tilOgMed).toBe("2024-04-14");
  });
});

describe("beregnForrigePeriodeDato()", () => {
  test("skal beregne riktige periodedatoer", () => {
    const result = beregnForrigePeriodeDato("2024-06-10");

    expect(result.fraOgMed).toBe("2024-05-27");
    expect(result.tilOgMed).toBe("2024-06-09");
  });

  test("skal beregne riktige periodedatoer", () => {
    const result = beregnForrigePeriodeDato("2024-12-31");

    expect(result.fraOgMed).toBe("2024-12-17");
    expect(result.tilOgMed).toBe("2024-12-30");
  });

  test("skal håndtere datooverganger korrekt", () => {
    const result = beregnForrigePeriodeDato("2024-01-01");

    expect(result.fraOgMed).toBe("2023-12-18");
    expect(result.tilOgMed).toBe("2023-12-31");
  });
});
