import { TrashIcon } from "@navikt/aksel-icons";
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
import { type IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { useState } from "react";

interface IProps {
  rapporteringsperiode: IRapporteringsperiode;
  valgtDato?: string;
  modalAapen: boolean;
  lukkModal: () => void;
}

export function AktivitetModal(props: IProps) {
  const { rapporteringsperiode, valgtDato } = props;
  const actionData = useActionData();
  const [valgtAktivitet, setValgtAktivitet] = useState<TAktivitetType | string>("");

  const dag = rapporteringsperiode.dager.find(
    (rapporteringsdag) => rapporteringsdag.dato === valgtDato
  );

  function hentSlettKnappTekst() {
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
      aria-labelledby="modal-heading"
      aria-label="Rapporter aktivitet"
      open={props.modalAapen}
      onClose={() => props.lukkModal()}
    >
      <Modal.Content>
        <Heading spacing level="1" size="medium" id="modal-heading" className={styles.modalHeader}>
          {valgtDato && format(new Date(valgtDato), "EEEE d", { locale: nbLocale })}
        </Heading>

        {dag &&
          dag.aktiviteter.map((aktivitet) => (
            <Form key={aktivitet.id} method="post">
              <input
                type="text"
                hidden
                name="rapporteringsperiodeId"
                defaultValue={rapporteringsperiode.id}
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

        <ValidatedForm method="post" key="lagre-ny-aktivitet" validator={validator(valgtAktivitet)}>
          <input
            type="text"
            hidden
            name="rapporteringsperiodeId"
            defaultValue={rapporteringsperiode.id}
          />
          <input type="text" hidden name="dato" defaultValue={valgtDato} />

          <div className={styles.aktivitetKontainer}>
            {dag?.muligeAktiviteter && (
              <AktivitetRadio
                name="type"
                muligeAktiviteter={dag.muligeAktiviteter}
                verdi={valgtAktivitet}
                onChange={(aktivitet: string) => setValgtAktivitet(aktivitet)}
              />
            )}
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
      </Modal.Content>
    </Modal>
  );
}
