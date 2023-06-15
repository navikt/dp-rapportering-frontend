import { TrashIcon } from "@navikt/aksel-icons";
import { Alert, Button, Heading, Modal } from "@navikt/ds-react";
import { Form, useActionData, useRouteLoaderData } from "@remix-run/react";
import classNames from "classnames";
import { format } from "date-fns";
import nbLocale from "date-fns/locale/nb";
import { ValidatedForm } from "remix-validated-form";
import { TallInput } from "~/components/TallInput";
import type { TAktivitetType } from "~/models/aktivitet.server";
import { IRapporteringLoader } from "~/routes/rapportering";
import { periodeSomTimer } from "~/utils/periode.utils";
import { validator } from "~/utils/validering.util";
import { AktivitetRadio } from "../aktivitet-radio/AktivitetRadio";

import styles from "./AktivitetModal.module.css";

interface IProps {
  rapporteringsperiodeId: string;
  valgtDato?: string;
  valgtAktivitet: string | TAktivitetType;
  setValgtAktivitet: (aktivitet: string | TAktivitetType) => void;
  modalAapen: boolean;
  setModalAapen: any;
  lukkModal: () => void;
  muligeAktiviteter: TAktivitetType[];
}

export function AktivitetModal(props: IProps) {
  const { rapporteringsperiode } = useRouteLoaderData("routes/rapportering") as IRapporteringLoader;
  const actionData = useActionData();

  const valgteDatoHarAktivitet = rapporteringsperiode.dager.find(
    (dag) => dag.dato === props.valgtDato
  );

  function hentSlettKnappTekst() {
    const aktivitet = valgteDatoHarAktivitet?.aktiviteter[0];

    if (aktivitet?.type === "Arbeid") {
      return `${aktivitet.type} ${periodeSomTimer(aktivitet.timer!)
        .toString()
        .replace(/\./g, ",")} timer`;
    }

    return `${aktivitet?.type}`;
  }

  return (
    <Modal
      aria-labelledby="modal-heading"
      aria-label="Rapporter aktivitet"
      open={props.modalAapen}
      onClose={() => props.lukkModal()}
    >
      <Modal.Content>
        <Heading spacing level="1" size="medium" id="modal-heading" className={styles.modalHeader}>
          {props.valgtDato && format(new Date(props.valgtDato), "EEEE d", { locale: nbLocale })}
        </Heading>

        {valgteDatoHarAktivitet &&
          valgteDatoHarAktivitet.aktiviteter.map((aktivitet) => (
            <Form key={aktivitet.id} method="post">
              <input
                type="text"
                hidden
                name="rapporteringsperiodeId"
                defaultValue={props.rapporteringsperiodeId}
              />
              <input type="text" hidden name="aktivitetId" defaultValue={aktivitet.id} />
              <button
                type="submit"
                name="submit"
                value="slette"
                className={classNames(styles.slettKnapp, styles[aktivitet.type])}
              >
                {hentSlettKnappTekst()}
                <TrashIcon title="a11y-title" fontSize="1.5rem" />
              </button>
            </Form>
          ))}

        <ValidatedForm
          method="post"
          key="lagre-ny-aktivitet"
          validator={validator(props.valgtAktivitet)}
        >
          <input
            type="text"
            hidden
            name="rapporteringsperiodeId"
            defaultValue={props.rapporteringsperiodeId}
          />
          <input type="text" hidden name="dato" defaultValue={props.valgtDato} />

          <div className={styles.aktivitetKontainer}>
            {props.muligeAktiviteter && (
              <AktivitetRadio
                name="type"
                muligeAktiviteter={props.muligeAktiviteter}
                verdi={props.valgtAktivitet}
                onChange={(aktivitet: string) => props.setValgtAktivitet(aktivitet)}
              />
            )}
          </div>

          {props.valgtAktivitet === "Arbeid" && <TallInput name="timer" label="Antall timer:" />}

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
      </Modal.Content>
    </Modal>
  );
}
