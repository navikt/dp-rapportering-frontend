import { describe, expect, test } from "vitest";

import { formaterPeriodeDato, formaterPeriodeTilUkenummer } from "./dato.utils";

describe("formaterPeriodeDato", () => {
  test("returnerer riktig periodeformat", () => {
    const fraOgMed = "2023-05-22";
    const tilOgMed = "2023-06-04";

    const periodeString = formaterPeriodeDato(fraOgMed, tilOgMed);

    expect(periodeString).toBe("22.05.2023 - 04.06.2023");
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
