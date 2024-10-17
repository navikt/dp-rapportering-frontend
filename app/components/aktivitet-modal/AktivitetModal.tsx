import styles from "./AktivitetModal.module.css";
import { Alert, Button, Heading, Modal } from "@navikt/ds-react";
import { useActionData, useFetcher } from "@remix-run/react";
import { ValidatedForm } from "remix-validated-form";
import type { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import type { action as rapporteringAction } from "~/routes/periode.$rapporteringsperiodeId.fyll-ut";
import { AktivitetType, aktivitetType } from "~/utils/aktivitettype.utils";
import { validator } from "~/utils/validering.util";
import { useSanity } from "~/hooks/useSanity";
import { useTypedRouteLoaderData } from "~/hooks/useTypedRouteLoaderData";
import { FormattertDato } from "../FormattertDato";
import { LesMer } from "../LesMer";
import { AktivitetCheckboxes } from "../aktivitet-checkbox/AktivitetCheckboxes";

interface IProps {
  periode: IRapporteringsperiode;
  valgtDato?: string;
  valgteAktiviteter: AktivitetType[];
  setValgteAktiviteter: (aktiviteter: AktivitetType[]) => void;
  modalAapen: boolean;
  lukkModal: () => void;
}

export function AktivitetModal({
  periode,
  modalAapen,
  lukkModal,
  valgteAktiviteter,
  setValgteAktiviteter,
  valgtDato,
}: IProps) {
  const { locale } = useTypedRouteLoaderData("root");

  const { getAppText } = useSanity();
  const actionData = useActionData<typeof rapporteringAction>();

  const dag = periode.dager.find((dag) => dag.dato === valgtDato);

  const fetcher = useFetcher();

  const slettHandler = () => {
    fetcher.submit(
      {
        rapporteringsperiodeId: periode.id,
        dag: JSON.stringify(dag),
      },
      { method: "post", action: "/api/slett" }
    );

    lukkModal();
  };

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
          {valgtDato && <FormattertDato locale={locale} dato={valgtDato} ukedag />}
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
                aktiviteter={dag.aktiviteter}
              />
            </div>

            <LesMer />

            {actionData?.status === "error" && actionData?.error && (
              <Alert variant="error" className={styles.feilmelding}>
                {getAppText(actionData.error.statusText)}
              </Alert>
            )}

            <div className={styles.knappKontainer}>
              <Button variant="secondary" type="button" name="submit" onClick={slettHandler}>
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
