import { Radio, RadioGroup } from "@navikt/ds-react";
import { useField } from "remix-validated-form";
import type { AktivitetType } from "~/models/aktivitet.server";
import { aktivitetTypeMap } from "~/utils/aktivitettype.utils";
import { useSanity } from "~/hooks/useSanity";

export interface IProps {
  name: string;
  label?: string;
  verdi?: string;
  muligeAktiviteter: readonly AktivitetType[];
  onChange: (aktivitet: string) => void;
}

export function AktivitetRadio(props: IProps) {
  const { error, getInputProps } = useField(props.name);
  const { getAppText } = useSanity();

  const inputProps: { type: string; value: string } = getInputProps({
    type: "radio",
    value: props.verdi || "",
  });

  function hentAktivitetBeskrivelse(aktivitet: AktivitetType) {
    switch (aktivitet) {
      case "Arbeid":
        return getAppText("rapportering-aktivitet-radio-arbeid-beskrivelse");
      case "Syk":
        return getAppText("rapportering-aktivitet-radio-syk-beskrivelse");
      case "Fravaer":
        return getAppText("rapportering-aktivitet-radio-fravaer-beskrivelse");
      default:
        return "";
    }
  }

  return (
    <RadioGroup
      legend={props.label}
      error={!inputProps.value ? error : undefined}
      {...inputProps}
      onChange={props.onChange}
    >
      {props.muligeAktiviteter.map((aktivitet) => (
        <Radio
          key={aktivitet}
          value={aktivitet}
          description={hentAktivitetBeskrivelse(aktivitet)}
          data-testid={`aktivitet-radio-${aktivitet}`}
        >
          {aktivitetTypeMap(aktivitet)}
        </Radio>
      ))}
    </RadioGroup>
  );
}
