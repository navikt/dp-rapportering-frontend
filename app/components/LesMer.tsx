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
      value: "jobb",
      content: getRichText("rapportering-les-mer-hva-skal-rapporteres-innhold-jobb"),
    },
    {
      value: "syk",
      content: getRichText("rapportering-les-mer-hva-skal-rapporteres-innhold-syk"),
    },
    {
      value: "ferie",
      content: getRichText("rapportering-les-mer-hva-skal-rapporteres-innhold-ferie"),
    },
    {
      value: "utdanning",
      content: getRichText("rapportering-les-mer-hva-skal-rapporteres-innhold-utdanning"),
    },
  ];

  let filtrertInnhold;

  if (selectedValues.length === 0) {
    filtrertInnhold = lesMerInnhold;
  } else {
    filtrertInnhold = lesMerInnhold.filter((element) => selectedValues.includes(element.value));
  }

  return (
    <div className={styles.container}>
      <ReadMore header={header} onOpenChange={trackOpenChange}>
        <CheckboxGroup legend="Hvilket tema vil du lese mer om?" onChange={handleCheckboxChange}>
          <Checkbox value="jobb">{aktivitetTypeMap(AktivitetType.Arbeid, getAppText)}</Checkbox>
          <Checkbox value="syk">{aktivitetTypeMap(AktivitetType.Syk, getAppText)}</Checkbox>
          <Checkbox value="ferie">{aktivitetTypeMap(AktivitetType.Fravaer, getAppText)}</Checkbox>
          <Checkbox value="utdanning">
            {aktivitetTypeMap(AktivitetType.Utdanning, getAppText)}
          </Checkbox>
        </CheckboxGroup>
        {filtrertInnhold.map((element) => (
          <PortableText key={element.value} value={element.content} />
        ))}
      </ReadMore>
    </div>
  );
}
