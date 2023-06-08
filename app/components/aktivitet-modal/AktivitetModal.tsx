import { TrashIcon } from "@navikt/aksel-icons";
import { Button, Heading, Modal, Radio, RadioGroup } from "@navikt/ds-react";
import { Form, useRouteLoaderData } from "@remix-run/react";
import classNames from "classnames";
import { format } from "date-fns";
import nbLocale from "date-fns/locale/nb";
import { ValidatedForm } from "remix-validated-form";
import { TallInput } from "~/components/TallInput";
import type { TAktivitetType } from "~/models/aktivitet.server";
import { IRapporteringLoader } from "~/routes/rapportering";
import { periodeSomTimer } from "~/utils/periode.utils";
import { AktivitetRadio } from "../aktivitet-radio/AktivitetRadio";
import { validator } from "~/utils/validering.util";

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
  lukkModal: () => void;
  muligeAktiviteter: TAktivitetType[];
}

export function AktivitetModal(props: IProps) {
  const { rapporteringsperiode } = useRouteLoaderData("routes/rapportering") as IRapporteringLoader;
  const dagMedAktivitet = rapporteringsperiode.dager.find((dag) => dag.dato === props.valgtDato);

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

        {dagMedAktivitet &&
          dagMedAktivitet.aktiviteter.map((aktivitet) => (
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
                className={classNames(styles.aktivitet, styles[aktivitet.type])}
              >
                <>
                  {aktivitet.type} {periodeSomTimer(aktivitet.timer!)} timer
                </>
                <TrashIcon title="a11y-title" fontSize="1.5rem" />
              </button>
            </Form>
          ))}

        <ValidatedForm
          method="post"
          key="lagre-ny-aktivitet"
          validator={validator(props.valgtAktivitet!)}
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
                verdi={props.valgtAktivitet!}
              />
            )}
          </div>

          {/* {props.valgtAktivitet === "Arbeid" && ( */}
          <TallInput name="timer" verdi={props.timer?.replace(/\./g, ",")} />
          {/* )} */}

          <div className={styles.knappKontainer}>
            <Button variant="tertiary-neutral" onClick={() => props.lukkModal()}>
              Avbryt
            </Button>
            <Button type="submit" name="submit" value="lagre">
              Lagre
            </Button>
          </div>
        </ValidatedForm>
      </Modal.Content>
    </Modal>
  );
}
