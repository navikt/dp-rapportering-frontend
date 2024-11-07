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
        if (!texts) {
          return value.dynamiskFelt.textId;
        }

        return texts[value.dynamiskFelt.textId] ?? value.dynamiskFelt.textId;
      },
    },
  };
}
