import { Alert, Button, Heading, Modal } from "@navikt/ds-react";
import { Form, useActionData } from "@remix-run/react";
import classNames from "classnames";
import { ValidatedForm } from "remix-validated-form";
import { TallInput } from "~/components/TallInput";
import type { IAktivitetType } from "~/models/aktivitet.server";
import { periodeSomTimer } from "~/utils/periode.utils";
import { validator } from "~/utils/validering.util";
import { AktivitetRadio } from "../aktivitet-radio/AktivitetRadio";

import styles from "./AktivitetModal.module.css";
import type { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { FormattertDato } from "../FormattertDato";
import { useEffect } from "react";

interface IProps {
  rapporteringsperiode: IRapporteringsperiode;
  valgtDato?: string;
  valgtAktivitet: string | IAktivitetType;
  setValgtAktivitet: (aktivitet: string | IAktivitetType) => void;
  modalAapen: boolean;
  lukkModal: () => void;
}

export function AktivitetModal(props: IProps) {
  const {
    rapporteringsperiode,
    modalAapen,
    lukkModal,
    valgtAktivitet,
    setValgtAktivitet,
    valgtDato,
  } = props;

  const actionData = useActionData();

  useEffect(() => {
    Modal.setAppElement("#dp-rapportering-frontend");
  }, []);

  const dag = rapporteringsperiode.dager.find(
    (rapporteringsdag) => rapporteringsdag.dato === valgtDato
  );

  function hentAktivitetTekst() {
    const aktivitet = dag?.aktiviteter[0];

    if (aktivitet?.type === "Arbeid") {
      return `${aktivitet.type} ${periodeSomTimer(aktivitet.timer!)
        .toString()
        .replace(/\./g, ",")} timer`;
    }

    return `${aktivitet?.type}`;
  }

  return (
    <Modal
      className={styles.modal}
      aria-labelledby="modal-heading"
      aria-label="Rapporter aktivitet"
      open={modalAapen}
      onClose={() => lukkModal()}
    >
      <Modal.Content>
        <Heading level="1" size="medium" id="modal-heading" className={styles.modalHeader}>
          {valgtDato && <FormattertDato dato={valgtDato} ukedag />}
        </Heading>

        {dag &&
          dag.aktiviteter.map((aktivitet) => (
            <Form key={aktivitet.id} method="post">
              <input type="text" hidden name="aktivitetId" defaultValue={aktivitet.id} />
              <div className={classNames(styles.registrertAktivitet, styles[aktivitet.type])}>
                {hentAktivitetTekst()}
              </div>
              <div className={styles.knappKontainer}>
                <Button type="submit" name="submit" value="slette">
                  Fjern registrering
                </Button>
              </div>
            </Form>
          ))}
        {dag && dag.muligeAktiviteter.length > 0 && (
          <ValidatedForm
            method="post"
            key="lagre-ny-aktivitet"
            validator={validator(valgtAktivitet)}
          >
            <input type="text" hidden name="dato" defaultValue={valgtDato} />

            <div className={styles.aktivitetKontainer}>
              <AktivitetRadio
                name="type"
                muligeAktiviteter={dag.muligeAktiviteter}
                verdi={valgtAktivitet}
                onChange={(aktivitet: string) => setValgtAktivitet(aktivitet)}
                label="Hva vil du registrere"
              />
            </div>

            {valgtAktivitet === "Arbeid" && (
              <TallInput name="timer" label="Antall timer:" className="my-4" />
            )}

            {actionData?.error && (
              <Alert variant="error" className={styles.feilmelding}>
                {actionData.error}
              </Alert>
            )}

            <div className={styles.knappKontainer}>
              <Button type="submit" name="submit" value="lagre">
                Lagre
              </Button>
            </div>
          </ValidatedForm>
        )}
      </Modal.Content>
    </Modal>
  );
}
