import { TrashIcon } from "@navikt/aksel-icons";
import { Button, Heading, Modal } from "@navikt/ds-react";
import { Form, useRouteLoaderData } from "@remix-run/react";
import { withZod } from "@remix-validated-form/with-zod";
import classNames from "classnames";
import { format } from "date-fns";
import nbLocale from "date-fns/locale/nb";
import { ValidatedForm } from "remix-validated-form";
import { TallInput } from "~/components/TallInput";
import type { TAktivitetType } from "~/models/aktivitet.server";
import { IRapporteringLoader } from "~/routes/rapportering";
import { periodeSomTimer } from "~/utils/periode.utils";
import { aktivitetsvalideringArbeid, aktivitetsvalideringSykFerie } from "~/utils/validering.util";

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

  const validator =
    props.valgtAktivitet === "Arbeid"
      ? withZod(aktivitetsvalideringArbeid)
      : withZod(aktivitetsvalideringSykFerie);

  const dagMedAktivitet = rapporteringsperiode.dager.find((dag) => dag.dato === props.valgtDato);

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
          {props.valgtDato && format(new Date(props.valgtDato), "EEEE d", { locale: nbLocale })}
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

          {/* Redigering modus */}
          {/* Todo rydd opp koden */}
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
                  className={classNames(styles.timeType, styles[aktivitet.type])}
                >
                  <>
                    {aktivitet.type} {periodeSomTimer(aktivitet.timer!)} timer
                  </>
                  <TrashIcon title="a11y-title" fontSize="1.5rem" />
                </button>
              </Form>
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
            <Button type="submit" name="submit" value="lagre">
              Lagre
            </Button>
          </div>
        </ValidatedForm>
      </Modal.Content>
    </Modal>
  );
}
