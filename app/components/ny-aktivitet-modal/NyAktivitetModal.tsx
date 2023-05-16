import { Button, Heading, Modal, TextField } from "@navikt/ds-react";
import classNames from "classnames";
import { Form } from "@remix-run/react";
import { TAktivitetType } from "~/models/aktivitet.server";

import styles from "./NyAktivitetModal.module.css";
import { ValidatedForm } from "remix-validated-form";
import { validerSkjema } from "~/utils/validering.util";
import { AktivitetTimerInput } from "../AktivitetTimerInput";

interface IProps {
  timer?: string;
  valgtDato?: string;
  setValgtDato: (dato: string) => void;
  valgtAktivitet?: TAktivitetType;
  setValgtAktivitet: (aktivitet: TAktivitetType) => void;
  modalAapen: boolean;
  setModalAapen: any;
  modalHeaderTekst?: string;
  lukkModal: () => void;
}

export function AktivitetModal(props: IProps) {
  return (
    <Modal
      aria-labelledby="modal-heading"
      aria-label="Rapporter aktivitet"
      open={props.modalAapen}
      onClose={() => props.lukkModal()}
      className={styles.timerforingModal}
    >
      <Modal.Content>
        <Heading spacing level="1" size="medium" id="modal-heading">
          {props.modalHeaderTekst}
        </Heading>
        <div className={styles.timeTypeKontainer}>
          <button
            className={classNames(styles.timeType, styles.aktivitetTypeArbeid)}
            onClick={() => props.setValgtAktivitet("arbeid")}
            hidden={!!props.valgtAktivitet && props.valgtAktivitet !== "arbeid"}
          >
            Arbeid
          </button>
          <button
            className={classNames(styles.timeType, styles.aktivitetTypeSyk)}
            onClick={() => props.setValgtAktivitet("sykdom")}
            hidden={!!props.valgtAktivitet && props.valgtAktivitet !== "sykdom"}
          >
            Syk
          </button>
          <button
            className={classNames(styles.timeType, styles.aktivitetTypeFerie)}
            onClick={() => props.setValgtAktivitet("ferie")}
            hidden={!!props.valgtAktivitet && props.valgtAktivitet !== "ferie"}
          >
            Fravær / Ferie
          </button>
        </div>
        <ValidatedForm method="post" key="lagre-ny-aktivitet" validator={validerSkjema}>
          <input type="text" hidden name="type" defaultValue={props.valgtAktivitet} />
          <input type="text" hidden name="dato" defaultValue={props.valgtDato} />
          {props.valgtAktivitet && (
            <AktivitetTimerInput name="timer" verdi={props.timer?.replace(/\./g, ",")} />
          )}
          <div className={styles.knappKontainer}>
            <Button variant="tertiary-neutral" onClick={() => props.lukkModal()}>
              Avbryt
            </Button>
            <Button type="submit">Lagre</Button>
          </div>
        </ValidatedForm>
      </Modal.Content>
    </Modal>
  );
}
