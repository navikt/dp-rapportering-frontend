// @vitest-environment node
import { addDays, format, subDays } from "date-fns";
import { describe, expect, test } from "vitest";

import { lagRapporteringsperiode } from "~/devTools/rapporteringsperiode";
import { KortType, OPPRETTET_AV } from "~/utils/types";

import { erSendtForSent, skalHaArbeidssokerSporsmal } from "./periode.utils";

describe("erSendtForSent", () => {
  test("skal returnere false når sisteFristForTrekk er null", () => {
    const periode = lagRapporteringsperiode({
      sisteFristForTrekk: null,
    });

    expect(erSendtForSent(periode)).toBe(false);
  });

  test("skal returnere false når sisteFristForTrekk er i fremtiden", () => {
    const fremtidigDato = format(addDays(new Date(), 7), "yyyy-MM-dd");
    const periode = lagRapporteringsperiode({
      sisteFristForTrekk: fremtidigDato,
    });

    expect(erSendtForSent(periode)).toBe(false);
  });

  test("skal returnere true når sisteFristForTrekk er passert", () => {
    const pastertDato = format(subDays(new Date(), 7), "yyyy-MM-dd");
    const periode = lagRapporteringsperiode({
      sisteFristForTrekk: pastertDato,
    });

    expect(erSendtForSent(periode)).toBe(true);
  });
});

describe("skalHaArbeidssokerSporsmal", () => {
  test("skal returnere true når perioden er opprettet av Dagpenger og ikke er etterregistrert", () => {
    const periode = lagRapporteringsperiode({
      opprettetAv: OPPRETTET_AV.Dagpenger,
      type: KortType.ORDINAERT,
      sisteFristForTrekk: null,
    });

    expect(skalHaArbeidssokerSporsmal(periode)).toBe(true);
  });

  test("skal returnere true når perioden er opprettet av Arena og ikke er etterregistrert", () => {
    const periode = lagRapporteringsperiode({
      opprettetAv: OPPRETTET_AV.Arena,
      type: KortType.ORDINAERT,
    });

    expect(skalHaArbeidssokerSporsmal(periode)).toBe(true);
  });

  test("skal returnere false når perioden er etterregistrert", () => {
    const periode = lagRapporteringsperiode({
      opprettetAv: OPPRETTET_AV.Dagpenger,
      type: KortType.ETTERREGISTRERT,
    });

    expect(skalHaArbeidssokerSporsmal(periode)).toBe(false);
  });

  test("skal returnere true når opprettetAv er null og ikke er etterregistrert", () => {
    const periode = lagRapporteringsperiode({
      opprettetAv: null,
      type: KortType.ORDINAERT,
    });

    expect(skalHaArbeidssokerSporsmal(periode)).toBe(true);
  });

  test("skal returnere true når perioden er opprettet av Arena og er korrigert", () => {
    const periode = lagRapporteringsperiode({
      opprettetAv: OPPRETTET_AV.Arena,
      type: KortType.KORRIGERT,
    });

    expect(skalHaArbeidssokerSporsmal(periode)).toBe(true);
  });

  test("skal returnere true når meldekortet sendes for sent (spørsmålet skal vises, men være disabled)", () => {
    const pastertDato = format(subDays(new Date(), 7), "yyyy-MM-dd");
    const periode = lagRapporteringsperiode({
      opprettetAv: OPPRETTET_AV.Dagpenger,
      type: KortType.ORDINAERT,
      sisteFristForTrekk: pastertDato,
    });

    expect(skalHaArbeidssokerSporsmal(periode)).toBe(true);
  });

  test("skal returnere true når meldekortet sendes før sisteFristForTrekk", () => {
    const fremtidigDato = format(addDays(new Date(), 7), "yyyy-MM-dd");
    const periode = lagRapporteringsperiode({
      opprettetAv: OPPRETTET_AV.Dagpenger,
      type: KortType.ORDINAERT,
      sisteFristForTrekk: fremtidigDato,
    });

    expect(skalHaArbeidssokerSporsmal(periode)).toBe(true);
  });
});
