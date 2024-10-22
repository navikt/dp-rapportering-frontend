import { ExternalLinkIcon } from "@navikt/aksel-icons";
import { PortableTextReactComponents } from "@portabletext/react";

export function getSanityPortableTextComponents(
  texts: {
    [key: string]: string | number;
  } = {}
): Partial<PortableTextReactComponents> {
  if (!texts["rapportering-apnes-i-ny-fane"]) {
    texts["rapportering-apnes-i-ny-fane"] = "åpnes i ny fane";
  }

  return {
    marks: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      link: ({
        value,
        children,
      }: {
        value?: { blank: boolean; href: string; _key: string };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        children: any;
      }) => {
        // Read https://css-tricks.com/use-target_blank/
        if (!value) return children;

        const { blank, href, _key } = value;

        return blank ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-labelledby={`tekst-${_key} sr-${_key}`}
          >
            <span id={`tekst-${_key}`}>{children}</span>
            <span id={`sr-${_key}`} className="sr-only">
              ({texts["rapportering-apnes-i-ny-fane"]})
            </span>
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
        if (!texts) {
          return value.dynamiskFelt.textId;
        }

        return texts[value.dynamiskFelt.textId] ?? value.dynamiskFelt.textId;
      },
    },
  };
}
