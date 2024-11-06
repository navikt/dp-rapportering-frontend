import { describe, expect, test, vi } from "vitest";
import {
  createLinkObject,
  createSanityMessageObject,
  createSanityRichTextObject,
  foundAppText,
  foundLink,
  foundMessage,
  foundRichText,
  getAppText,
  getLink,
  getMessage,
  getRichText,
} from "~/hooks/useSanity";

const sanityTexts = {
  appTexts: [{ textId: "tekst-tekstnøkkel", valueText: "Tekst fra Sanity" }],
  richTexts: [
    {
      textId: "rik-tekstnøkkel",
      body: createSanityRichTextObject("Rik tekst fra Sanity"),
    },
  ],
  messages: [{ ...createSanityMessageObject("melding-tekstnøkkel"), title: "Melding fra Sanity" }],
  links: [{ ...createLinkObject("lenke-tekstnøkkel"), linkText: "Lenke fra Sanity" }],
};

describe("useSanity", () => {
  vi.mock(import("~/hooks/useSanity"), async (importOriginal) => {
    const actual = await importOriginal();
    return {
      ...actual,
    };
  });

  test("foundAppText finner ikke tekst og returnerer false", () => {
    expect(foundAppText("rapportering-tekst", "rapportering-tekst")).toBe(false);
  });

  test("foundAppText finner tekst og returnerer true", () => {
    expect(foundAppText("Tekst fra Sanity", "rapportering-tekst")).toBe(true);
  });

  test("text er undefined, og foundRichText returnerer false", () => {
    expect(foundRichText(undefined, "rapportering-tekst")).toBe(false);
  });

  test("foundRichText finner ikke tekst og returnerer false", () => {
    expect(
      foundRichText(createSanityRichTextObject("rapportering-tekst"), "rapportering-tekst")
    ).toBe(false);
  });

  test("foundRichText finner tekst og returnerer true", () => {
    expect(
      foundRichText(createSanityRichTextObject("Tekst fra Sanity"), "rapportering-tekst")
    ).toBe(true);
  });

  test("foundMessage finner ikke link og returnerer false", () => {
    expect(
      foundMessage(createSanityMessageObject("rapportering-message"), "rapportering-message")
    ).toBe(false);
  });

  test("foundMessage finner melding og returnerer true", () => {
    expect(foundMessage(createSanityMessageObject("Link fra Sanity"), "rapportering-message")).toBe(
      true
    );
  });

  test("foundLink finner ikke link og returnerer false", () => {
    expect(foundLink(createLinkObject("rapportering-link"), "rapportering-link")).toBe(false);
  });

  test("foundLink finner link og returnerer true", () => {
    expect(foundLink(createLinkObject("Link fra Sanity"), "rapportering-link")).toBe(true);
  });

  test("getAppText returnerer tekst fra Sanity", () => {
    const text = getAppText(sanityTexts, "tekst-tekstnøkkel");

    expect(text).toBe("Tekst fra Sanity");
  });

  test("getAppText returnerer tekstnøkkel når teksten ikke finnes i Sanity", () => {
    const text = getAppText(sanityTexts, "tekstnøkkel-som-ikke-finnes");

    expect(text).toBe("tekstnøkkel-som-ikke-finnes");
  });

  test("getRichText returnerer tekst fra Sanity", () => {
    const text = getRichText(sanityTexts, "rik-tekstnøkkel");
    expect(text).toEqual(createSanityRichTextObject("Rik tekst fra Sanity"));
  });

  test("getRichText returnerer tekstnøkkel når teksten ikke finnes i Sanity", () => {
    const text = getRichText(sanityTexts, "rik-tekstnøkkel-som-ikke-finnes");
    expect(text).toEqual(createSanityRichTextObject("rik-tekstnøkkel-som-ikke-finnes"));
  });

  test("getMessage returnerer melding fra Sanity", () => {
    const text = getMessage(sanityTexts, "melding-tekstnøkkel");
    expect(text.title).toBe("Melding fra Sanity");
  });

  test("getMessage returnerer tekstnøkkel når meldingen ikke finnes i Sanity", () => {
    const text = getMessage(sanityTexts, "melding-tekstnøkkel-som-ikke-finnes");
    expect(text.title).toBe("melding-tekstnøkkel-som-ikke-finnes");
  });

  test("getLink returnerer lenke fra Sanity", () => {
    const link = getLink(sanityTexts, "lenke-tekstnøkkel");
    expect(link.linkText).toBe("Lenke fra Sanity");
  });

  test("getLink returnerer tekstnøkkel når lenken ikke finnes i Sanity", () => {
    const link = getLink(sanityTexts, "lenke-tekstnøkkel-som-ikke-finnes");
    expect(link.linkText).toBe("lenke-tekstnøkkel-som-ikke-finnes");
  });
});
