import { Alert, Button, Heading, Modal } from "@navikt/ds-react";
import { Form, useActionData } from "@remix-run/react";
import classNames from "classnames";
import { format } from "date-fns";
import nbLocale from "date-fns/locale/nb";
import { ValidatedForm } from "remix-validated-form";
import { TallInput } from "~/components/TallInput";
import type { TAktivitetType } from "~/models/aktivitet.server";
import { periodeSomTimer } from "~/utils/periode.utils";
import { validator } from "~/utils/validering.util";
import { AktivitetRadio } from "../aktivitet-radio/AktivitetRadio";

import styles from "./AktivitetModal.module.css";
import type { IRapporteringsperiodeDag } from "~/models/rapporteringsperiode.server";

interface IProps {
  rapporteringsperiodeDag?: IRapporteringsperiodeDag;
  valgtDato?: string;
  valgtAktivitet: string | TAktivitetType;
  setValgtAktivitet: (aktivitet: string | TAktivitetType) => void;
  modalAapen: boolean;
  setModalAapen: any;
  lukkModal: () => void;
  muligeAktiviteter: TAktivitetType[];
}

export function AktivitetModal(props: IProps) {
  const {
    rapporteringsperiodeDag,
    modalAapen,
    lukkModal,
    valgtDato,
    muligeAktiviteter,
    valgtAktivitet,
    setValgtAktivitet,
  } = props;

  const actionData = useActionData();
  const valgteDatoHarAktivitet = rapporteringsperiodeDag;

  function hentSlettKnappTekst() {
    const aktivitet = valgteDatoHarAktivitet?.aktiviteter[0];

    if (aktivitet?.type === "Arbeid") {
      return `${aktivitet.type} ${periodeSomTimer(aktivitet.timer!)
        .toString()
        .replace(/\./g, ",")} timer`;
    }

    return `${aktivitet?.type}`;
  }

  const dagOgDato = valgtDato ? format(new Date(valgtDato), "EEEE d.", { locale: nbLocale }) : "";
  const maane = valgtDato ? format(new Date(valgtDato), "MMMM", { locale: nbLocale }) : "";

  return (
    <Modal
      className={styles.modal}
      aria-labelledby="modal-heading"
      aria-label="Rapporter aktivitet"
      open={modalAapen}
      onClose={() => lukkModal()}
    >
      <Modal.Content>
        <Heading spacing level="1" size="medium" id="modal-heading" className={styles.modalHeader}>
          {dagOgDato} <span>{maane}</span>
        </Heading>

        {valgteDatoHarAktivitet &&
          valgteDatoHarAktivitet.aktiviteter.map((aktivitet) => (
            <Form key={aktivitet.id} method="post">
              <input type="text" hidden name="aktivitetId" defaultValue={aktivitet.id} />
              <div className={classNames(styles.slettKnapp, styles[aktivitet.type])}>
                {hentSlettKnappTekst()}
              </div>
              <div className={styles.knappKontainer}>
                <Button type="submit" name="submit" value="slette">
                  Fjern registrering
                </Button>
              </div>
            </Form>
          ))}
        {muligeAktiviteter.length > 0 && (
          <ValidatedForm
            method="post"
            key="lagre-ny-aktivitet"
            validator={validator(valgtAktivitet)}
          >
            <input type="text" hidden name="dato" defaultValue={valgtDato} />

            <div className={styles.aktivitetKontainer}>
              <AktivitetRadio
                name="type"
                muligeAktiviteter={muligeAktiviteter}
                verdi={valgtAktivitet}
                onChange={(aktivitet: string) => setValgtAktivitet(aktivitet)}
                label="Hva vil du registrere"
              />
            </div>

            {valgtAktivitet === "Arbeid" && <TallInput name="timer" label="Antall timer:" />}

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
