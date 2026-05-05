// @vitest-environment node
import { describe, expect, test } from "vitest";

import { lagRapporteringsperiode } from "~/devTools/rapporteringsperiode";
import { KortType, OPPRETTET_AV } from "~/utils/types";

import { skalHaArbeidssokerSporsmal } from "./periode.utils";

describe("skalHaArbeidssokerSporsmal", () => {
  test("skal returnere true når perioden er opprettet av Dagpenger og ikke er etterregistrert", () => {
    const periode = lagRapporteringsperiode({
      opprettetAv: OPPRETTET_AV.Dagpenger,
      type: KortType.ORDINAERT,
    });

    expect(skalHaArbeidssokerSporsmal(periode)).toBe(true);
  });

  test("skal returnere false når perioden er opprettet av Arena", () => {
    const periode = lagRapporteringsperiode({
      opprettetAv: OPPRETTET_AV.Arena,
      type: KortType.ORDINAERT,
    });

    expect(skalHaArbeidssokerSporsmal(periode)).toBe(false);
  });

  test("skal returnere false når perioden er etterregistrert", () => {
    const periode = lagRapporteringsperiode({
      opprettetAv: OPPRETTET_AV.Dagpenger,
      type: KortType.ETTERREGISTRERT,
    });

    expect(skalHaArbeidssokerSporsmal(periode)).toBe(false);
  });

  test("skal returnere false når opprettetAv er null", () => {
    const periode = lagRapporteringsperiode({
      opprettetAv: null,
      type: KortType.ORDINAERT,
    });

    expect(skalHaArbeidssokerSporsmal(periode)).toBe(false);
  });

  test("skal returnere false når perioden er opprettet av Arena selv om den ikke er etterregistrert", () => {
    const periode = lagRapporteringsperiode({
      opprettetAv: OPPRETTET_AV.Arena,
      type: KortType.KORRIGERT,
    });

    expect(skalHaArbeidssokerSporsmal(periode)).toBe(false);
  });
});
