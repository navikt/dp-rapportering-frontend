import { periodeSomTimer } from "./periode.utils";
import { describe, expect, test } from "vitest";

describe("periodeSomTimer", () => {
  test("skal returnere riktig antall timer for en gyldig periode-streng", () => {
    expect(periodeSomTimer("PT2H30M")).toBe(2.5);
  });

  test("skal kaste error hvis periode-strengen er ugyldig", () => {
    expect(() => periodeSomTimer("ugyldig-periode")).toThrow("Invalid duration");
  });
});
