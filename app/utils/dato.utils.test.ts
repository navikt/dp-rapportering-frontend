import { describe, expect, test } from "vitest";

import { formaterPeriodeDato, formaterPeriodeTilUkenummer } from "./dato.utils";
import { DecoratorLocale } from "./dekoratoren.utils";

describe("formaterPeriodeDato", () => {
  test("returnerer riktig periodeformat", () => {
    const fraOgMed = "2023-05-22";
    const tilOgMed = "2023-06-04";

    const locale = DecoratorLocale.NB;

    const periodeString = formaterPeriodeDato(fraOgMed, tilOgMed, locale);

    expect(periodeString).toBe("22. mai 2023 - 04. juni 2023");
  });
});

describe("formaterPeriodeTilUkenummer", () => {
  test("returnerer riktig periodeukenummer", () => {
    const fraOgMed = "2023-05-22";
    const tilOgMed = "2023-06-04";

    const periodeString = formaterPeriodeTilUkenummer(fraOgMed, tilOgMed);

    expect(periodeString).toBe("21 - 22");
  });
});
