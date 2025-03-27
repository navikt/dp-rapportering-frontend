import { Alert, Button, Heading, Modal } from "@navikt/ds-react";
import { useActionData, useFetcher, useNavigation } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { ValidatedForm } from "remix-validated-form";
import { uuidv7 } from "uuidv7";

import { useAnalytics } from "~/hooks/useAnalytics";
import { useLocale } from "~/hooks/useLocale";
import { useSanity } from "~/hooks/useSanity";
import type { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import type { action as rapporteringAction } from "~/routes/periode.$rapporteringsperiodeId.fyll-ut";
import { AktivitetType, aktivitetType } from "~/utils/aktivitettype.utils";
import { useIsSubmitting } from "~/utils/useIsSubmitting";
import { validator } from "~/utils/validering.util";

import { AktivitetCheckboxes } from "../aktivitet-checkbox/AktivitetCheckboxes";
import { FormattertDato } from "../FormattertDato";
import { LesMer } from "../LesMer";
import styles from "./AktivitetModal.module.css";

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
  const { locale } = useLocale();

  const { getAppText } = useSanity();
  const actionData = useActionData<typeof rapporteringAction>();
  const [sesjonId, setSesjonId] = useState<string>("");
  const modalId = "aktivitet-modal";

  const dag = periode.dager.find((dag) => dag.dato === valgtDato);

  const fetcher = useFetcher();
  const navigation = useNavigation();
  const isSubmitting = useIsSubmitting(navigation);
  const modalRef = useRef<HTMLDivElement>(null);
  const { trackModalApnet, trackModalLukket } = useAnalytics();
  const [harLoggetLukket, setHarLoggetLukket] = useState<boolean>(false);

  function loggModalLukket(knapp: string, antallAktiviteter: number) {
    if (harLoggetLukket) return;

    /**
     * onClose kalles ved alle handlinger som lukker modalen, men er også den
     * eneste metoden vi har for å lytte på avbryt-knappen. onClose er den siste
     * metoden som blir kalt, så her sørger vi for at bare én logg blir sendt per
     * 100ms
     */
    setHarLoggetLukket(true);
    setTimeout(() => {
      setHarLoggetLukket(false);
    }, 100);

    trackModalLukket({
      skjemaId: periode.id,
      modalId,
      sesjonId,
      knapp,
      antallAktiviteter,
    });
  }

  function slettHandler() {
    fetcher.submit(
      {
        rapporteringsperiodeId: periode.id,
        dag: JSON.stringify(dag),
      },
      { method: "post", action: "/api/slett-aktivitet" },
    );

    loggModalLukket("slett", 0);
    lukkModal();
  }

  function onClose() {
    loggModalLukket("lukk", 0);
    lukkModal();
  }

  function onSubmit(data: { type: string[]; timer?: number }) {
    loggModalLukket("lagre", data.type?.length ?? 0);
  }

  useEffect(() => {
    if (modalAapen) {
      modalRef?.current?.scrollTo({ top: 0 });
      const id = uuidv7();
      setSesjonId(id);
      trackModalApnet({ skjemaId: periode.id, modalId, sesjonId: id });
    }
  }, [modalAapen]);

  return (
    <Modal
      className={styles.modal}
      aria-labelledby="aktivitet-modal-heading"
      open={modalAapen}
      onClose={onClose}
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
      <Modal.Body ref={modalRef}>
        {dag && (
          <ValidatedForm
            method="post"
            key="lagre-ny-aktivitet"
            validator={validator()}
            onSubmit={onSubmit}
          >
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
                periodeId={periode.id}
              />
            </div>

            <LesMer periodeId={periode.id} />

            {actionData?.status === "error" && actionData?.error && (
              <Alert variant="error" className={styles.feilmelding}>
                {getAppText(actionData.error.statusText)}
              </Alert>
            )}

            <div className={styles.knappKontainer}>
              <Button variant="secondary" type="button" onClick={slettHandler}>
                {getAppText("rapportering-slett")}
              </Button>
              <Button type="submit" name="submit" value="lagre" disabled={isSubmitting}>
                {getAppText("rapportering-lagre")}
              </Button>
            </div>
          </ValidatedForm>
        )}
      </Modal.Body>
    </Modal>
  );
}
