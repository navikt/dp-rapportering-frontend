import { Radio, RadioGroup } from "@navikt/ds-react";
import classNames from "classnames";
import { useField } from "remix-validated-form";
import { TAktivitetType } from "~/models/aktivitet.server";

import { useState } from "react";
import styles from "./AktivitetRadio.module.css";

export interface IProps {
  name: string;
  label?: string;
  verdi?: string;
  muligeAktiviteter: TAktivitetType[];
}

export function AktivitetRadio(props: IProps) {
  const { error, getInputProps } = useField(props.name);
  const [value, setValue] = useState(props.verdi || "");

  const inputProps: any = getInputProps({
    type: "radio",
    value,
  });

  return (
    <RadioGroup
      legend={props.label}
      error={!value ? error : undefined}
      {...inputProps}
      onChange={(verdi) => setValue(verdi)}
    >
      {props.muligeAktiviteter.map((aktivitet) => (
        <Radio
          key={aktivitet}
          className={classNames(styles.aktivitet, styles[aktivitet])}
          value={aktivitet}
        >
          {aktivitet}
        </Radio>
      ))}
    </RadioGroup>
  );
}
