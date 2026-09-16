import { describe, expect, test } from "vitest";

import { sanityRichText, sanityTekst } from "./sanity.utils";

describe("sanityTekst", () => {
  test("viser manglende felt i testmiljø", () => {
    expect(sanityTekst(undefined, "felt", true)).toBe("[Mangler Sanity: felt]");
  });

  test("skjuler manglende felt når diagnostikk er deaktivert", () => {
    expect(sanityTekst(undefined, "felt", false)).toBe("");
  });
});

describe("sanityRichText", () => {
  test("returnerer manglende felt som rich text i testmiljø", () => {
    expect(sanityRichText(undefined, "felt", true)[0].children[0].text).toBe(
      "[Mangler Sanity: felt]",
    );
  });

  test("skjuler manglende rich text når diagnostikk er deaktivert", () => {
    expect(sanityRichText(undefined, "felt", false)).toEqual([]);
  });

  test("behandler tom rich-text-liste som manglende", () => {
    expect(sanityRichText([], "felt", true)[0].children[0].text).toBe("[Mangler Sanity: felt]");
  });
});
