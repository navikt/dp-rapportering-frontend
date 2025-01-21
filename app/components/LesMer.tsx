import { Checkbox, CheckboxGroup, ReadMore } from "@navikt/ds-react";
import { PortableText } from "@portabletext/react";
import { useState } from "react";

import { useAnalytics } from "~/hooks/useAnalytics";
import { useSanity } from "~/hooks/useSanity";
import { AktivitetType, aktivitetTypeMap } from "~/utils/aktivitettype.utils";

import styles from "../styles/lesMer.module.css";

interface IProps {
  periodeId: string;
}

export const lesMerInnhold = [
  {
    value: AktivitetType.Arbeid,
    content: "rapportering-les-mer-hva-skal-rapporteres-innhold-jobb",
  },
  {
    value: AktivitetType.Syk,
    content: "rapportering-les-mer-hva-skal-rapporteres-innhold-syk",
  },
  {
    value: AktivitetType.Fravaer,
    content: "rapportering-les-mer-hva-skal-rapporteres-innhold-ferie",
  },
  {
    value: AktivitetType.Utdanning,
    content: "rapportering-les-mer-hva-skal-rapporteres-innhold-utdanning",
  },
];

export function LesMer({ periodeId }: IProps) {
  const { getRichText, getAppText } = useSanity();
  const { trackAccordionApnet, trackAccordionLukket } = useAnalytics();

  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  const tekstId = "rapportering-les-mer-hva-skal-rapporteres-tittel";
  const header = getAppText(tekstId);

  function trackOpenChange(open: boolean) {
    if (open) {
      trackAccordionApnet({ skjemaId: periodeId, tekst: header, tekstId });
    } else {
      trackAccordionLukket({ skjemaId: periodeId, tekst: header, tekstId });
    }
  }

  function handleCheckboxChange(values: string[]) {
    setSelectedValues(values);
  }

  const filtrertInnhold = lesMerInnhold.filter(
    (element) => selectedValues.length === 0 || selectedValues.includes(element.value),
  );

  return (
    <div className={styles.container}>
      <ReadMore header={header} onOpenChange={trackOpenChange}>
        <CheckboxGroup
          legend={getAppText("rapportering-les-mer-hva-skal-rapporteres-legend")}
          onChange={handleCheckboxChange}
        >
          {lesMerInnhold.map((element) => (
            <Checkbox key={element.value} value={element.value}>
              {aktivitetTypeMap(element.value, getAppText)}
            </Checkbox>
          ))}
        </CheckboxGroup>
        {filtrertInnhold.map((element) => (
          <PortableText key={element.value} value={getRichText(element.content)} />
        ))}
      </ReadMore>
    </div>
  );
}
