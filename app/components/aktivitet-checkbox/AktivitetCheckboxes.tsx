import { Checkbox, CheckboxGroup, ReadMore } from "@navikt/ds-react";
import { PortableText } from "@portabletext/react";
import classNames from "classnames";
import { useField } from "remix-validated-form";

import { useAmplitude } from "~/hooks/useAmplitude";
import { type GetAppText, useSanity } from "~/hooks/useSanity";
import { AktivitetType, aktivitetTypeMap, IAktivitet } from "~/utils/aktivitettype.utils";
import { periodeSomTimer } from "~/utils/periode.utils";

import { TallInput } from "../tall-input/TallInput";
import styles from "./AktivitetCheckboxes.module.css";

export interface IProps {
  name: string;
  label?: string;
  verdi: AktivitetType[];
  muligeAktiviteter: readonly AktivitetType[];
  onChange: (aktivitet: AktivitetType[]) => void;
  aktiviteter: IAktivitet[];
  periodeId: string;
}

export function erIkkeAktiv(aktiviteter: AktivitetType[], aktivitet: AktivitetType) {
  if (
    aktiviteter.includes(AktivitetType.Arbeid) &&
    [AktivitetType.Syk, AktivitetType.Fravaer].includes(aktivitet)
  ) {
    return true;
  }

  if (aktiviteter.includes(AktivitetType.Syk) && aktivitet === AktivitetType.Arbeid) {
    return true;
  }

  if (aktiviteter.includes(AktivitetType.Fravaer) && aktivitet === AktivitetType.Arbeid) {
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
  periodeId,
}: IProps) {
  const { error } = useField(name);
  const { getAppText, getRichText } = useSanity();
  const { trackAccordionApnet, trackAccordionLukket } = useAmplitude();

  const tekstId = "rapportering-aktivitet-jobb-prosentstilling-tittel";
  const header = getAppText(tekstId);

  function trackOpenChange(open: boolean) {
    if (open) {
      trackAccordionApnet({ skjemaId: periodeId, tekst: header, tekstId });
    } else {
      trackAccordionLukket({ skjemaId: periodeId, tekst: header, tekstId });
    }
  }

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
            {verdi.includes(AktivitetType.Arbeid) && aktivitet === "Arbeid" && (
              <div className={styles.timer}>
                <TallInput
                  name="timer"
                  label={`${getAppText("rapportering-antall-timer")}`}
                  verdi={periodeSomTimer(
                    aktiviteter?.find((aktivitet) => aktivitet.type === "Arbeid")?.timer ?? "",
                  )}
                />
                <PortableText value={getRichText("rapportering-input-tall-beskrivelse")} />

                <ReadMore
                  header={header}
                  className={styles.prosentstilling}
                  onOpenChange={trackOpenChange}
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
