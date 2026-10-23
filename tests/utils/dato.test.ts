// @vitest-environment node
import { describe, expect, test } from "vitest";

import { formaterArbeidssokerperiode } from "~/utils/dato.utils";
import { DecoratorLocale } from "~/utils/dekoratoren.utils";

describe("formaterArbeidssokerperiode", () => {
  const dagensDato = new Date(2026, 0, 15, 12);

  test("utelater år på fra-dato i inneværende år, men ikke på til-dato", () => {
    const periode = {
      fraOgMed: new Date(2026, 4, 1, 12),
      tilOgMed: new Date(2026, 4, 14, 12),
    };

    expect(formaterArbeidssokerperiode(periode, DecoratorLocale.NB, dagensDato)).toEqual({
      fom: "1. mai",
      tom: "14. mai 2026",
    });
    expect(formaterArbeidssokerperiode(periode, DecoratorLocale.EN, dagensDato)).toEqual({
      fom: "1. May",
      tom: "14. May 2026",
    });
  });

  test("viser år på begge datoer ved årsskifte", () => {
    const periode = {
      fraOgMed: new Date(2026, 11, 28, 12),
      tilOgMed: new Date(2027, 0, 10, 12),
    };

    expect(formaterArbeidssokerperiode(periode, DecoratorLocale.NB, dagensDato)).toEqual({
      fom: "28. desember 2026",
      tom: "10. januar 2027",
    });
  });

  test("viser år på begge datoer for en eldre periode", () => {
    const periode = {
      fraOgMed: new Date(2024, 4, 1, 12),
      tilOgMed: new Date(2024, 4, 14, 12),
    };

    expect(formaterArbeidssokerperiode(periode, DecoratorLocale.NB, dagensDato)).toEqual({
      fom: "1. mai 2024",
      tom: "14. mai 2024",
    });
  });
});
