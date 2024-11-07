import { PortableTextReactComponents } from "@portabletext/react";

export function getSanityPortableTextComponents(
  texts: {
    [key: string]: string | number;
  } = {}
): Partial<PortableTextReactComponents> {
  return {
    types: {
      dynamicFieldReference: ({
        value,
      }: {
        value: { dynamiskFelt: { textId: string; type: string } };
      }) => {
        if (!texts || !texts[value.dynamiskFelt.textId]) {
          console.error("Fant ikke dynamiskFelt-tekst for", value.dynamiskFelt.textId);
          return <span key={value.dynamiskFelt.textId}>{value.dynamiskFelt.textId}</span>;
        }

        return <span key={value.dynamiskFelt.textId}>{texts[value.dynamiskFelt.textId]}</span>;
      },
    },
  };
}
