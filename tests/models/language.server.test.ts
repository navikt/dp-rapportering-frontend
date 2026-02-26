import { describe, expect, it } from "vitest";

import { getLanguage, setLanguage } from "~/models/language.server";
import { DecoratorLocale } from "~/utils/dekoratoren.utils";

describe("getLanguage", () => {
  it("returnerer riktig locale fra cookie", async () => {
    const request = new Request("http://localhost", {
      headers: { Cookie: "decorator-language=nb" },
    });

    const result = await getLanguage(request);

    expect(result).toBe(DecoratorLocale.NB);
  });

  it("returnerer riktig locale for alle støttede språk", async () => {
    const locales = [
      DecoratorLocale.NB,
      DecoratorLocale.NN,
      DecoratorLocale.EN,
      DecoratorLocale.SE,
      DecoratorLocale.PL,
      DecoratorLocale.UK,
      DecoratorLocale.RU,
    ];

    for (const locale of locales) {
      const request = new Request("http://localhost", {
        headers: { Cookie: `decorator-language=${locale}` },
      });

      const result = await getLanguage(request);

      expect(result).toBe(locale);
    }
  });

  it("returnerer undefined når cookie mangler", async () => {
    const request = new Request("http://localhost");

    const result = await getLanguage(request);

    expect(result).toBeUndefined();
  });

  it("returnerer undefined når decorator-language cookie ikke er satt, men andre cookies finnes", async () => {
    const request = new Request("http://localhost", {
      headers: { Cookie: "some-other-cookie=value" },
    });

    const result = await getLanguage(request);

    expect(result).toBeUndefined();
  });
});

describe("setLanguage", () => {
  it("setter decorator-language cookie", async () => {
    const result = await setLanguage("", DecoratorLocale.NB);

    expect(result).toContain("decorator-language=nb");
  });

  it("beholder eksisterende cookies og legger til ny språk-cookie", async () => {
    const result = await setLanguage("some-other-cookie=value", DecoratorLocale.EN);

    expect(result).toContain("decorator-language=en");
    expect(result).toContain("some-other-cookie=value");
  });

  it("oppdaterer eksisterende decorator-language cookie", async () => {
    const result = await setLanguage("decorator-language=nb", DecoratorLocale.NN);

    expect(result).toContain("decorator-language=nn");
    expect(result).not.toContain("decorator-language=nb");
  });

  it("setter riktig locale for alle støttede språk", async () => {
    const locales = [
      DecoratorLocale.NB,
      DecoratorLocale.NN,
      DecoratorLocale.EN,
      DecoratorLocale.SE,
      DecoratorLocale.PL,
      DecoratorLocale.UK,
      DecoratorLocale.RU,
    ];

    for (const locale of locales) {
      const result = await setLanguage("", locale);

      expect(result).toContain(`decorator-language=${locale}`);
    }
  });
});
