import { ReadMore } from "@navikt/ds-react";
import { PortableText } from "@portabletext/react";
import { useSanity } from "~/hooks/useSanity";

export function LesMer() {
  const { getRichText } = useSanity();
  return (
    <ReadMore header="Les mer om hva som skal rapporteres">
      <PortableText value={getRichText("rapportering-les-mer-hva-skal-rapporteres")} />
    </ReadMore>
  );
}
