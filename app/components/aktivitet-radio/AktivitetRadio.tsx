import { Radio, RadioGroup } from "@navikt/ds-react";
import { useField } from "remix-validated-form";
import type { TAktivitetType } from "~/models/aktivitet.server";

export interface IProps {
  name: string;
  label?: string;
  verdi?: string;
  muligeAktiviteter: TAktivitetType[];
  onChange: (aktivitet: string) => void;
}

export function AktivitetRadio(props: IProps) {
  const { error, getInputProps } = useField(props.name);

  const inputProps: { type: string; value: string } = getInputProps({
    type: "radio",
    value: props.verdi || "",
  });

  function hentAktivitetBeskrivelse(aktivitet: TAktivitetType) {
    switch (aktivitet) {
      case "Arbeid":
        return "Skriv antall timer du har jobbet, både lønnet og ulønnet. Får du lønn for flere timer enn du har jobbet, skriver du timene du får lønn for.";
      case "Syk":
        return "Jeg har vært syk, og derfor forhindret fra å ta arbeid.";
      case "Ferie":
        return "Jeg har hatt ferie eller fravær, og derfor vært forhindret fra å ta arbeid.";
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
          {aktivitet}
        </Radio>
      ))}
    </RadioGroup>
  );
}
