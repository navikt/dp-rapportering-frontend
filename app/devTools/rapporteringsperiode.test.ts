import { lagRapporteringsperiode } from "./rapporteringsperiode";
import { describe, expect, test } from "vitest";

describe("lagRapporteringsperiode", () => {
  test("skal generere en periode med 14 dager", () => {
    const id = "123";
    const fraOgMed = "2024-06-08";
    const tilOgMed = "2024-06-21";

    const rapporteringsperiode = lagRapporteringsperiode(id, fraOgMed, tilOgMed);

    expect(rapporteringsperiode.dager).toHaveLength(14);
    rapporteringsperiode.dager.forEach((dag, index) => {
      const forventetDato = new Date(fraOgMed);
      forventetDato.setDate(forventetDato.getDate() + index);
      expect(dag.dato).toBe(forventetDato.toISOString().split("T")[0]);
    });
  });

  test("skal ha riktig kanSendesFra-dato", () => {
    const id = "123";
    const fraOgMed = "2024-06-08";
    const tilOgMed = "2024-06-21";

    const rapporteringsperiode = lagRapporteringsperiode(id, fraOgMed, tilOgMed);

    const expectedKanSendesFra = new Date(tilOgMed);
    expectedKanSendesFra.setDate(expectedKanSendesFra.getDate() - 1);

    expect(rapporteringsperiode.kanSendesFra).toBe(
      expectedKanSendesFra.toISOString().split("T")[0]
    );
  });

  test("skal generere unike id-er for hver periode", () => {
    const id1 = "123";
    const fraOgMed1 = "2024-09-01";
    const tilOgMed1 = "2024-09-14";

    const id2 = "456";
    const fraOgMed2 = "2024-10-01";
    const tilOgMed2 = "2024-10-14";

    const rapporteringsperiode1 = lagRapporteringsperiode(id1, fraOgMed1, tilOgMed1);
    const rapporteringsperiode2 = lagRapporteringsperiode(id2, fraOgMed2, tilOgMed2);

    expect(rapporteringsperiode1.id).not.toBe(rapporteringsperiode2.id);
  });
});
