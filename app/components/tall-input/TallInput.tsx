import style from "./Tallinput.module.css";
import { BodyShort, TextField } from "@navikt/ds-react";
import { PortableText } from "@portabletext/react";
import { useField } from "remix-validated-form";
import { useSanity } from "~/hooks/useSanity";

export interface IProps {
  name: string;
  label?: string;
  verdi?: number;
  className?: string;
}

export function TallInput(props: IProps) {
  const { error, getInputProps } = useField(props.name);
  const { getRichText } = useSanity();

  return (
    <div>
      <TextField
        type="text"
        inputMode="decimal"
        name={props.name}
        className={props.className}
        defaultValue={props.verdi}
        error={error}
        {...getInputProps({
          id: props.name,
          label: <>{props.label}</>,
        })}
      />

      <BodyShort className={style.tallInputBeskrivelse} textColor="subtle">
        <PortableText value={getRichText("rapportering-input-tall-beskrivelse")} />
      </BodyShort>
    </div>
  );
}
