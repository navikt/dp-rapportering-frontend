import { BodyShort, Heading } from "@navikt/ds-react";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";

import styles from "./PortableTextRenderer.module.css";

const block: PortableTextComponents["block"] = {
  normal: ({ children }) => <BodyShort className={styles.paragraph}>{children}</BodyShort>,
  h2: ({ children }) => (
    <Heading size="small" level="2">
      {children}
    </Heading>
  ),
  h3: ({ children }) => (
    <Heading size="xsmall" level="3">
      {children}
    </Heading>
  ),
  blockquote: ({ children }) => <blockquote>{children}</blockquote>,
};

const components: PortableTextComponents = {
  block,
  list: {
    bullet: ({ children }) => <ul className={styles.list}>{children}</ul>,
    number: ({ children }) => <ol className={styles.list}>{children}</ol>,
  },
  listItem: {
    bullet: ({ children }) => <li>{children}</li>,
    number: ({ children }) => <li>{children}</li>,
  },
};

interface PortableTextRendererProps {
  value: PortableTextBlock[] | null | undefined;
}

export function PortableTextRenderer({ value }: PortableTextRendererProps) {
  return (
    <div className={styles.content}>
      <PortableText value={value} components={components} />
    </div>
  );
}
