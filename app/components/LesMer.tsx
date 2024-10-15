import { ExternalLinkIcon } from "@navikt/aksel-icons";
import { ReadMore } from "@navikt/ds-react";
import { PortableText } from "@portabletext/react";
import { useSanity } from "~/hooks/useSanity";

const components = {
  marks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    link: ({ value, children }: { value?: { blank: boolean; href: string }; children: any }) => {
      // Read https://css-tricks.com/use-target_blank/
      if (!value) return children;

      const { blank, href } = value;

      console.log(blank, href);

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
};

export function LesMer() {
  const { getRichText, getAppText } = useSanity();
  return (
    <div className="les-mer-container">
      <ReadMore header={getAppText("rapportering-les-mer-hva-skal-rapporteres-tittel")}>
        <PortableText
          components={components}
          value={getRichText("rapportering-les-mer-hva-skal-rapporteres-innhold")}
        />
      </ReadMore>
    </div>
  );
}
