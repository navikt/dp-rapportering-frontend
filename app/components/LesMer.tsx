import { ReadMore } from "@navikt/ds-react";
import { PortableText } from "@portabletext/react";
import { useSanity } from "~/hooks/useSanity";

export function LesMer() {
  const { getRichText, getAppText } = useSanity();
  return (
    <div className="les-mer-container">
      <ReadMore header={getAppText("rapportering-les-mer-hva-skal-rapporteres-tittel")}>
        <PortableText value={getRichText("rapportering-les-mer-hva-skal-rapporteres-innhold")} />
      </ReadMore>
    </div>
  );
}
