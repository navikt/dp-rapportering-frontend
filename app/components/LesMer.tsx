import { Checkbox, CheckboxGroup, ReadMore } from "@navikt/ds-react";
import { PortableText } from "@portabletext/react";
import { useState } from "react";

import { useAmplitude } from "~/hooks/useAmplitude";
import { useSanity } from "~/hooks/useSanity";
import { AktivitetType, aktivitetTypeMap } from "~/utils/aktivitettype.utils";

import styles from "../styles/lesMer.module.css";

interface IProps {
  periodeId: string;
}

export function LesMer({ periodeId }: IProps) {
  const { getRichText, getAppText } = useSanity();
  const { trackAccordionApnet, trackAccordionLukket } = useAmplitude();

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

  const lesMerInnhold = [
    {
      value: AktivitetType.Arbeid,
      content: getRichText("rapportering-les-mer-hva-skal-rapporteres-innhold-jobb"),
    },
    {
      value: AktivitetType.Syk,
      content: getRichText("rapportering-les-mer-hva-skal-rapporteres-innhold-syk"),
    },
    {
      value: AktivitetType.Fravaer,
      content: getRichText("rapportering-les-mer-hva-skal-rapporteres-innhold-ferie"),
    },
    {
      value: AktivitetType.Utdanning,
      content: getRichText("rapportering-les-mer-hva-skal-rapporteres-innhold-utdanning"),
    },
  ];

  const filtrertInnhold =
    selectedValues.length === 0
      ? lesMerInnhold
      : lesMerInnhold.filter((element) => selectedValues.includes(element.value));

  return (
    <div className={styles.container}>
      <ReadMore header={header} onOpenChange={trackOpenChange}>
        <CheckboxGroup legend="Hvilket tema vil du lese mer om?" onChange={handleCheckboxChange}>
          {Object.values(AktivitetType).map((type) => (
            <Checkbox key={type} value={type}>
              {aktivitetTypeMap(type, getAppText)}
            </Checkbox>
          ))}
        </CheckboxGroup>
        {filtrertInnhold.map((element) => (
          <PortableText key={element.value} value={element.content} />
        ))}
      </ReadMore>
    </div>
  );
}
