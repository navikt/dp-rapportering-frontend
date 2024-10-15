import { ExternalLinkIcon } from "@navikt/aksel-icons";
import { PortableTextReactComponents } from "@portabletext/react";

export function getSanityPortableTextComponents(
  replaceWithValue: {
    [key: string]: string | number;
  } = {}
): Partial<PortableTextReactComponents> {
  return {
    marks: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      link: ({ value, children }: { value?: { blank: boolean; href: string }; children: any }) => {
        // Read https://css-tricks.com/use-target_blank/
        if (!value) return children;

        const { blank, href } = value;

        return blank ? (
          <a href={href} target="_blank" rel="noreferrer">
            {children}
            <ExternalLinkIcon title="a11y-title" />
          </a>
        ) : (
          <a href={href}>{children}</a>
        );
      },
    },
    types: {
      dynamicFieldReference: ({
        value,
      }: {
        value: { dynamiskFelt: { textId: string; type: string } };
      }) => {
        if (!replaceWithValue) {
          return value.dynamiskFelt.textId;
        }

        return replaceWithValue[value.dynamiskFelt.textId] ?? value.dynamiskFelt.textId;
      },
    },
  };
}
