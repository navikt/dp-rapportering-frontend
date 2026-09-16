import type { PortableTextBlock } from "@portabletext/types";

import { isLocalOrDemo } from "./env.utils";

function skalViseManglerSanityTekst(): boolean {
  return (
    import.meta.env.DEV ||
    import.meta.env.MODE === "test" ||
    import.meta.env.VITEST === true ||
    (typeof process !== "undefined" && process.env.NODE_ENV !== "production") ||
    isLocalOrDemo
  );
}

export function sanityTekst(
  value: string | null | undefined,
  field: string,
  showMissingSanityText = skalViseManglerSanityTekst(),
): string {
  if (value?.length) return value;

  return showMissingSanityText ? `[Mangler Sanity: ${field}]` : "";
}

export function sanityRichText(
  value: PortableTextBlock[] | null | undefined,
  field: string,
  showMissingSanityText = skalViseManglerSanityTekst(),
): PortableTextBlock[] {
  if (value?.length) return value;

  if (!showMissingSanityText) return [];

  return [
    {
      _key: `missing-${field}`,
      _type: "block",
      children: [
        {
          _key: `missing-${field}-text`,
          _type: "span",
          marks: [],
          text: `[Mangler Sanity: ${field}]`,
        },
      ],
      markDefs: [],
      style: "normal",
    },
  ];
}
