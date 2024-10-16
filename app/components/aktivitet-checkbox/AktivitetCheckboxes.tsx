import styles from "./AktivitetCheckboxes.module.css";
import { Checkbox, CheckboxGroup, ReadMore } from "@navikt/ds-react";
import { PortableText } from "@portabletext/react";
import classNames from "classnames";
import { useField } from "remix-validated-form";
import type { AktivitetType, IAktivitet } from "~/models/aktivitet.server";
import { aktivitetTypeMap } from "~/utils/aktivitettype.utils";
import { periodeSomTimer } from "~/utils/periode.utils";
import { type GetAppText, useSanity } from "~/hooks/useSanity";
import { TallInput } from "../tall-input/TallInput";

export interface IProps {
  name: string;
  label?: string;
  verdi: AktivitetType[];
  muligeAktiviteter: readonly AktivitetType[];
  onChange: (aktivitet: AktivitetType[]) => void;
  aktiviteter: IAktivitet[];
}

export function erIkkeAktiv(aktiviteter: AktivitetType[], aktivitet: AktivitetType) {
  if (aktiviteter.includes("Arbeid") && ["Syk", "Fravaer"].includes(aktivitet)) {
    return true;
  }

  if (aktiviteter.includes("Syk") && aktivitet === "Arbeid") {
    return true;
  }

  if (aktiviteter.includes("Fravaer") && aktivitet === "Arbeid") {
    return true;
  }

  return false;
}

export function hentAktivitetBeskrivelse(aktivitet: AktivitetType, getAppText: GetAppText) {
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
}

export function AktivitetCheckboxes({
  name,
  label,
  verdi,
  muligeAktiviteter,
  aktiviteter,
  onChange,
}: IProps) {
  const { error } = useField(name);
  const { getAppText, getRichText } = useSanity();

  return (
    <CheckboxGroup legend={label} error={error || undefined} value={verdi} onChange={onChange}>
      {muligeAktiviteter.map((aktivitet) => {
        return (
          <div
            key={aktivitet}
            className={classNames(styles.checkbox, {
              [styles.arbeid]: aktivitet === "Arbeid",
              [styles.syk]: aktivitet === "Syk",
              [styles.fravaer]: aktivitet === "Fravaer",
              [styles.utdanning]: aktivitet === "Utdanning",
            })}
          >
            <Checkbox
              key={aktivitet}
              disabled={erIkkeAktiv(verdi, aktivitet)}
              value={aktivitet}
              description={hentAktivitetBeskrivelse(aktivitet, getAppText)}
              data-testid={`aktivitet-radio-${aktivitet}`}
              name={name}
            >
              {aktivitetTypeMap(aktivitet, getAppText)}
            </Checkbox>
            {verdi.includes("Arbeid") && aktivitet === "Arbeid" && (
              <div className={styles.timer}>
                <TallInput
                  name="timer"
                  label={`${getAppText("rapportering-antall-timer")}`}
                  verdi={periodeSomTimer(
                    aktiviteter?.find((aktivitet) => aktivitet.type === "Arbeid")?.timer ?? ""
                  )}
                />
                <PortableText value={getRichText("rapportering-input-tall-beskrivelse")} />

                <ReadMore
                  header={getAppText("rapportering-aktivitet-jobb-prosentstilling-tittel")}
                  className={styles.prosentstilling}
                >
                  <PortableText
                    value={getRichText("rapportering-aktivitet-jobb-prosentstilling-innhold")}
                  />
                </ReadMore>
              </div>
            )}
          </div>
        );
      })}
    </CheckboxGroup>
  );
}
