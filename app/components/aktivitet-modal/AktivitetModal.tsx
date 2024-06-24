import styles from "./AktivitetModal.module.css";
import { Alert, Button, Heading, Modal } from "@navikt/ds-react";
import { useActionData } from "@remix-run/react";
import { ValidatedForm } from "remix-validated-form";
import type { AktivitetType } from "~/models/aktivitet.server";
import type { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import type { action as korrigeringAction } from "~/routes/korriger.$rapporteringsperiodeId.fyll-ut";
import type { action as rapporteringAction } from "~/routes/periode.$rapporteringsperiodeId.fyll-ut";
import { aktivitetType } from "~/utils/aktivitettype.utils";
import { periodeSomTimer } from "~/utils/periode.utils";
import { validator } from "~/utils/validering.util";
import { useSanity } from "~/hooks/useSanity";
import { TallInput } from "~/components/TallInput";
import { FormattertDato } from "../FormattertDato";
import { AktivitetCheckboxes } from "../aktivitet-checkbox/AktivitetCheckboxes";

interface IProps {
  rapporteringsperiode: IRapporteringsperiode;
  valgtDato?: string;
  valgteAktiviteter: AktivitetType[];
  setValgteAktiviteter: (aktiviteter: AktivitetType[]) => void;
  modalAapen: boolean;
  lukkModal: () => void;
}

export function AktivitetModal({
  rapporteringsperiode,
  modalAapen,
  lukkModal,
  valgteAktiviteter,
  setValgteAktiviteter,
  valgtDato,
}: IProps) {
  const { getAppText } = useSanity();
  const actionData = useActionData<typeof rapporteringAction | typeof korrigeringAction>();

  const dag = rapporteringsperiode.dager.find(
    (rapporteringsdag) => rapporteringsdag.dato === valgtDato
  );

  return (
    <Modal
      className={styles.modal}
      aria-labelledby="aktivitet-modal-heading"
      open={modalAapen}
      onClose={lukkModal}
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
        {dag && (
          <ValidatedForm method="post" key="lagre-ny-aktivitet" validator={validator()}>
            <input type="hidden" name="dato" defaultValue={valgtDato} />
            <input type="hidden" name="dag" defaultValue={JSON.stringify(dag)} />

            <div className={styles.aktivitetKontainer}>
              <AktivitetCheckboxes
                name="type"
                muligeAktiviteter={aktivitetType}
                verdi={valgteAktiviteter}
                onChange={setValgteAktiviteter}
                label={getAppText("rapportering-hva-vil-du-lagre")}
              />
            </div>

            {valgteAktiviteter.includes("Arbeid") && (
              <TallInput
                name="timer"
                label={`${getAppText("rapportering-antall-timer")}:`}
                className="my-4"
                verdi={periodeSomTimer(
                  dag.aktiviteter.find((aktivitet) => aktivitet.type === "Arbeid")?.timer ?? ""
                )}
              />
            )}

            {actionData?.status === "error" && actionData?.error && (
              <Alert variant="error" className={styles.feilmelding}>
                {actionData.error.statusText}
              </Alert>
            )}

            <div className={styles.knappKontainer}>
              <Button variant="secondary" type="submit" name="submit" value="slette">
                {getAppText("rapportering-slett")}
              </Button>
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
