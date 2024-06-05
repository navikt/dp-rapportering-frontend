import styles from "./AktivitetModal.module.css";
import { Alert, Button, Heading, Modal } from "@navikt/ds-react";
import { Form, useActionData } from "@remix-run/react";
import classNames from "classnames";
import { ValidatedForm } from "remix-validated-form";
import type { AktivitetType } from "~/models/aktivitet.server";
import type { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import type { action as korringeringAction } from "~/routes/korriger.$rapporteringsperiodeId.fyll-ut";
import type { action as rapporteringAction } from "~/routes/periode.$rapporteringsperiodeId.fyll-ut";
import { aktivitetsTyper } from "~/utils/aktivitetstyper";
import { periodeSomTimer } from "~/utils/periode.utils";
import { validator } from "~/utils/validering.util";
import { useSanity } from "~/hooks/useSanity";
import { TallInput } from "~/components/TallInput";
import { FormattertDato } from "../FormattertDato";
import { AktivitetRadio } from "../aktivitet-radio/AktivitetRadio";

interface IProps {
  rapporteringsperiode: IRapporteringsperiode;
  valgtDato?: string;
  valgtAktivitet: string | AktivitetType;
  setValgtAktivitet: (aktivitet: string | AktivitetType) => void;
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

  const { getAppText } = useSanity();

  const dag = rapporteringsperiode.dager.find(
    (rapporteringsdag) => rapporteringsdag.dato === valgtDato
  );

  const actionData = useActionData<typeof rapporteringAction | typeof korringeringAction>();

  function hentAktivitetTekst() {
    const aktivitet = dag?.aktiviteter[0];

    if (aktivitet?.type === "Arbeid") {
      return `${aktivitet.type} ${periodeSomTimer(aktivitet.timer!)
        .toString()
        .replace(/\./g, ",")} ${getAppText("rapportering-timer")}`;
    }

    return `${aktivitet?.type}`;
  }

  return (
    <Modal
      className={styles.modal}
      aria-labelledby="aktivitet-modal-heading"
      open={modalAapen}
      onClose={() => lukkModal()}
    >
      <Modal.Header>
        <Heading
          level="1"
          size="medium"
          id="aktivitet-modal-heading"
          className={styles.modalHeader}
          aria-label={getAppText("rapportering-rapporter-aktivitet")}
        >
          {valgtDato && <FormattertDato dato={valgtDato} ukedag />}
        </Heading>
      </Modal.Header>
      <Modal.Body>
        {dag &&
          dag.aktiviteter.map((aktivitet) => (
            <Form key={aktivitet.id} method="post">
              <input type="text" hidden name="aktivitetId" defaultValue={aktivitet.id} />
              <div className={classNames(styles.registrertAktivitet, styles[aktivitet.type])}>
                {hentAktivitetTekst()}
              </div>

              {actionData?.status === "error" && actionData?.error && (
                <Alert variant="error" className={styles.feilmelding}>
                  {actionData.error.statusText}
                </Alert>
              )}

              <div className={styles.knappKontainer}>
                <Button type="submit" name="submit" value="slette">
                  {getAppText("rapportering-fjern-registrering")}
                </Button>
              </div>
            </Form>
          ))}
        {dag && (
          <ValidatedForm
            method="post"
            key="lagre-ny-aktivitet"
            validator={validator(valgtAktivitet)}
          >
            <input type="text" hidden name="dato" defaultValue={valgtDato} />

            <div className={styles.aktivitetKontainer}>
              <AktivitetRadio
                name="type"
                muligeAktiviteter={aktivitetsTyper}
                verdi={valgtAktivitet}
                onChange={(aktivitet: string) => setValgtAktivitet(aktivitet)}
                label={getAppText("rapportering-hva-vil-du-lagre")}
              />
            </div>

            {valgtAktivitet === "Arbeid" && (
              <TallInput
                name="timer"
                label={`${getAppText("rapportering-antall-timer")}:`}
                className="my-4"
              />
            )}

            {actionData?.status === "error" && actionData?.error && (
              <Alert variant="error" className={styles.feilmelding}>
                {actionData.error.statusText}
              </Alert>
            )}

            <div className={styles.knappKontainer}>
              <Button type="submit" name="submit" value="lagre">
                {getAppText("rapportering-lagre")}
              </Button>
            </div>
          </ValidatedForm>
        )}
      </Modal.Body>
    </Modal>
  );
}
