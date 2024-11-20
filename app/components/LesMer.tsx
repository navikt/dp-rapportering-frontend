import { ReadMore } from "@navikt/ds-react";
import { PortableText } from "@portabletext/react";
import { useSanity } from "~/hooks/useSanity";
import styles from "../styles/lesMer.module.css";

export function LesMer() {
  const { getRichText, getAppText } = useSanity();
  return (
    <div className={styles.lesMerContainer}>
      <ReadMore header={getAppText("rapportering-les-mer-hva-skal-rapporteres-tittel")}>
        <PortableText value={getRichText("rapportering-les-mer-hva-skal-rapporteres-innhold")} />
      </ReadMore>
    </div>
  );
}
