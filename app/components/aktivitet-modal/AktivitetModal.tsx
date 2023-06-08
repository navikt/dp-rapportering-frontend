import { Button, Heading, Modal } from "@navikt/ds-react";
import { withZod } from "@remix-validated-form/with-zod";
import classNames from "classnames";
import { ValidatedForm } from "remix-validated-form";
import type { TAktivitetType } from "~/models/aktivitet.server";
import { aktivitetsvalideringArbeid, aktivitetsvalideringSykFerie } from "~/utils/validering.util";
import { TallInput } from "../TallInput";

import styles from "./AktivitetModal.module.css";

interface IProps {
  rapporteringsperiodeId: string;
  timer?: string;
  valgtDato?: string;
  setValgtDato: (dato: string) => void;
  valgtAktivitet?: TAktivitetType;
  setValgtAktivitet: (aktivitet: TAktivitetType) => void;
  modalAapen: boolean;
  setModalAapen: any;
  modalHeaderTekst?: string;
  lukkModal: () => void;
  muligeAktiviteter: TAktivitetType[];
}

export function AktivitetModal(props: IProps) {
  const validator =
    props.valgtAktivitet === "Arbeid"
      ? withZod(aktivitetsvalideringArbeid)
      : withZod(aktivitetsvalideringSykFerie);
  return (
    <Modal
      aria-labelledby="modal-heading"
      aria-label="Rapporter aktivitet"
      open={props.modalAapen}
      onClose={() => props.lukkModal()}
      className={styles.timerforingModal}
    >
      <Modal.Content>
        <Heading spacing level="1" size="medium" id="modal-heading" className={styles.modalHeader}>
          {props.modalHeaderTekst}
        </Heading>
        <div className={styles.timeTypeKontainer}>
          {props.muligeAktiviteter &&
            props.muligeAktiviteter.map((aktivitet) => (
              <button
                key={aktivitet}
                className={classNames(styles.timeType, styles[aktivitet])}
                onClick={() => props.setValgtAktivitet(aktivitet)}
                hidden={!!props.valgtAktivitet && props.valgtAktivitet !== aktivitet}
              >
                {aktivitet}
              </button>
            ))}
        </div>
        <ValidatedForm method="post" key="lagre-ny-aktivitet" validator={validator}>
          <input
            type="text"
            hidden
            name="rapporteringsperiodeId"
            defaultValue={props.rapporteringsperiodeId}
          />
          <input type="text" hidden name="type" defaultValue={props.valgtAktivitet} />
          <input type="text" hidden name="dato" defaultValue={props.valgtDato} />
          {props.valgtAktivitet === "Arbeid" && (
            <TallInput name="timer" verdi={props.timer?.replace(/\./g, ",")} />
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
