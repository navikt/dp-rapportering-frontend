import { TextField } from "@navikt/ds-react";
import { useField } from "@rvf/react-router";

import { useSanity } from "~/hooks/useSanity";

export interface IProps {
  name: string;
  label?: string;
  verdi?: number;
  className?: string;
}

export function TallInput(props: IProps) {
  const { error, getInputProps } = useField(props.name);
  const { getAppText } = useSanity();
  const errorText = error();

  return (
    <TextField
      type="text"
      inputMode="decimal"
      name={props.name}
      defaultValue={props.verdi}
      error={errorText ? getAppText(errorText) : undefined}
      {...getInputProps({
        id: props.name,
        label: props.label,
      })}
    />
  );
}
