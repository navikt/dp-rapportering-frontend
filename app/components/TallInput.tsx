import { TextField } from "@navikt/ds-react";
import { useField } from "remix-validated-form";

export interface IProps {
  name: string;
  label?: string;
  verdi?: string;
  className?: string;
}

export function TallInput(props: IProps) {
  const { error, getInputProps } = useField(props.name);
  return (
    <TextField
      type="text"
      inputMode="numeric"
      className={props.className}
      defaultValue={props.verdi}
      error={error}
      description={"Halve timer skrives som desimal, 7 timer 30 min = 7,5 timer"}
      {...getInputProps({
        id: props.name,
        label: <>{props.label}</>,
      })}
    />
  );
}
