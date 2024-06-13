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
  onChange: (aktivitet: AktivitetType[]) => void;
}

export function AktivitetCheckboxes({ name, label, verdi, muligeAktiviteter, onChange }: IProps) {
  const { error } = useField(name);
  const { getAppText } = useSanity();

  const hentAktivitetBeskrivelse = (aktivitet: AktivitetType) => {
    switch (aktivitet) {
      case "Arbeid":
        return getAppText("rapportering-aktivitet-radio-arbeid-beskrivelse");
      case "Utdanning":
        return getAppText("rapportering-aktivitet-radio-utdanning-beskrivelse");
      case "Syk":
        return getAppText("rapportering-aktivitet-radio-syk-beskrivelse");
      case "Fravaer":
        return getAppText("rapportering-aktivitet-radio-fravaer-beskrivelse");
      default:
        return "";
    }
  };

  const erIkkeAktiv = (aktiviteter: AktivitetType[], aktivitet: AktivitetType) => {
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
  };

  return (
    <CheckboxGroup legend={label} error={error || undefined} value={verdi} onChange={onChange}>
      {muligeAktiviteter.map((aktivitet) => (
        <Checkbox
          className={classNames(styles.checkbox, {
            [styles.arbeid]: aktivitet === "Arbeid",
            [styles.syk]: aktivitet === "Syk",
            [styles.fravaer]: aktivitet === "Fravaer",
            [styles.utdanning]: aktivitet === "Utdanning",
          })}
          key={aktivitet}
          disabled={erIkkeAktiv(verdi, aktivitet)}
          value={aktivitet}
          description={hentAktivitetBeskrivelse(aktivitet)}
          data-testid={`aktivitet-radio-${aktivitet}`}
          name={name}
        >
          {aktivitetTypeMap(aktivitet)}
        </Checkbox>
      ))}
    </CheckboxGroup>
  );
}
