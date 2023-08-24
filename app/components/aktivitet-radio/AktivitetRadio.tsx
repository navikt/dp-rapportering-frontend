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

  return (
    <RadioGroup
      legend={props.label}
      error={!inputProps.value ? error : undefined}
      {...inputProps}
      onChange={props.onChange}
    >
      {props.muligeAktiviteter.map((aktivitet) => (
        <Radio key={aktivitet} value={aktivitet}>
          {aktivitet}
        </Radio>
      ))}
    </RadioGroup>
  );
}
