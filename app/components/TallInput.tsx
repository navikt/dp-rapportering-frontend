import { TextField } from "@navikt/ds-react";
import { useField } from "remix-validated-form";
import { useSanity } from "~/hooks/useSanity";

export interface IProps {
  name: string;
  label?: string;
  verdi?: string;
  className?: string;
}

export function TallInput(props: IProps) {
  const { error, getInputProps } = useField(props.name);
  const { getAppText } = useSanity();

  return (
    <TextField
      type="text"
      inputMode="numeric"
      className={props.className}
      defaultValue={props.verdi}
      error={error}
      description={getAppText("rapportering-input-tall-beskrivelse")}
      {...getInputProps({
        id: props.name,
        label: <>{props.label}</>,
      })}
    />
  );
}
