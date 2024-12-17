import { ReadMore } from "@navikt/ds-react";
import { PortableText } from "@portabletext/react";

import { useAnalytics } from "~/hooks/useAnalytics";
import { useSanity } from "~/hooks/useSanity";

import styles from "../styles/lesMer.module.css";

interface IProps {
  periodeId: string;
}

export function LesMer({ periodeId }: IProps) {
  const { getRichText, getAppText } = useSanity();
  const { trackAccordionApnet, trackAccordionLukket } = useAnalytics();

  const tekstId = "rapportering-les-mer-hva-skal-rapporteres-tittel";
  const header = getAppText(tekstId);

  function trackOpenChange(open: boolean) {
    if (open) {
      trackAccordionApnet({ skjemaId: periodeId, tekst: header, tekstId });
    } else {
      trackAccordionLukket({ skjemaId: periodeId, tekst: header, tekstId });
    }
  }

  return (
    <div className={styles.container}>
      <ReadMore header={header} onOpenChange={trackOpenChange}>
        <PortableText value={getRichText("rapportering-les-mer-hva-skal-rapporteres-innhold")} />
      </ReadMore>
    </div>
  );
}
