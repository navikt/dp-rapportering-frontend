import styles from "./AktivitetCheckboxes.module.css";
import { Checkbox, CheckboxGroup } from "@navikt/ds-react";
import classNames from "classnames";
import { useField } from "remix-validated-form";
import type { AktivitetType } from "~/models/aktivitet.server";
import { aktivitetTypeMap } from "~/utils/aktivitettype.utils";
import { useSanity } from "~/hooks/useSanity";

export interface IProps {
  name: string;
  label?: string;
  verdi: AktivitetType[];
  muligeAktiviteter: readonly AktivitetType[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (aktivitet: any[]) => void;
}

export function AktivitetCheckboxes(props: IProps) {
  const { error } = useField(props.name);
  const { getAppText } = useSanity();

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

  function erIkkeAktiv(aktiviteter: AktivitetType[], aktivitet: AktivitetType) {
    if (
      (aktiviteter.includes("Arbeid") || aktiviteter.includes("Utdanning")) &&
      !["Arbeid", "Utdanning"].includes(aktivitet)
    ) {
      return true;
    }

    if (aktiviteter.includes("Syk") && aktivitet !== "Syk") {
      return true;
    }

    if (aktiviteter.includes("Fravaer") && aktivitet !== "Fravaer") {
      return true;
    }

    return false;
  }

  return (
    <CheckboxGroup
      legend={props.label}
      error={!props.verdi ? error : undefined}
      value={props.verdi}
      onChange={props.onChange}
    >
      {props.muligeAktiviteter.map((aktivitet) => (
        <Checkbox
          className={classNames(styles.checkbox, {
            [styles.arbeid]: aktivitet === "Arbeid",
            [styles.syk]: aktivitet === "Syk",
            [styles.fravaer]: aktivitet === "Fravaer",
            [styles.utdanning]: aktivitet === "Utdanning",
          })}
          key={aktivitet}
          disabled={erIkkeAktiv(props.verdi, aktivitet)}
          value={aktivitet}
          description={hentAktivitetBeskrivelse(aktivitet)}
          data-testid={`aktivitet-radio-${aktivitet}`}
        >
          {aktivitetTypeMap(aktivitet)}
        </Checkbox>
      ))}
    </CheckboxGroup>
  );
}
