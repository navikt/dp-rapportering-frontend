import { Button, Heading, Modal, TextField } from "@navikt/ds-react";
import classNames from "classnames";
import { useEffect, useState } from "react";

import { Form, useActionData } from "@remix-run/react";
import { periodeMock } from "~/mocks/periodeMock";
import { hentDatoFraDatoString, hentUkedagTekstMedDatoIndex } from "~/utils/dato.utils";
import styles from "./Kalender.module.css";
import { action } from "~/routes/rapportering._index";

export function Kalender() {
  const [valgtAktivitet, setValgtAktivitet] = useState<string | undefined>(undefined);
  const [valgtDato, setValgtDato] = useState<string | undefined>(undefined);
  const [timer, setTimer] = useState<string | undefined>(undefined); // Her skal være defult verdi til timer input
  const [modalHeaderTekst, setModalHeaderTekst] = useState("");
  const [open, setOpen] = useState(false);

  const actionData = useActionData<typeof action>();

  const periode = periodeMock;
  const ukedager = ["man", "tir", "ons", "tor", "fre", "lør", "søn"];
  const helgIndex = [5, 6, 12, 13];

  useEffect(() => {
    Modal.setAppElement("#dp-rapportering-frontend");
  }, []);

  function aapneModal(dato: string, datoIndex: number) {
    setValgtAktivitet(undefined);
    setValgtDato(dato);

    setOpen(true);

    const ukedag = hentUkedagTekstMedDatoIndex(datoIndex);
    setModalHeaderTekst(`${ukedag} ${hentDatoFraDatoString(dato)}`);
  }

  return (
    <div className={styles.kalender}>
      <div className={styles.kalenderUkedagKontainer}>
        {ukedager.map((ukedag, index) => {
          return (
            <div key={index} className={styles.kalenderUkedag}>
              {ukedag}
            </div>
          );
        })}
      </div>
      <div className={styles.kalenderDatoKontainer}>
        {periode.dager.map((dag) => {
          return (
            <button
              className={classNames(styles.kalenderDato, {
                [styles.helg]: helgIndex.includes(dag.dagIndex),
              })}
              key={dag.dagIndex}
              onClick={() => aapneModal(dag.dato, dag.dagIndex)}
            >
              <p>{hentDatoFraDatoString(dag.dato)}</p>.
            </button>
          );
        })}
      </div>
      <Modal
        open={open}
        aria-label="Rapporter aktivitet"
        onClose={() => setOpen((x) => !x)}
        aria-labelledby="modal-heading"
        className={styles.timerforingModal}
      >
        <Modal.Content>
          <Heading spacing level="1" size="medium" id="modal-heading">
            {modalHeaderTekst}
          </Heading>
          <div className={styles.timeTypeKontainer}>
            <button
              className={classNames(styles.timeType, styles.aktivitetTypeArbeid)}
              onClick={() => setValgtAktivitet("arbeid")}
              hidden={!!valgtAktivitet && valgtAktivitet !== "arbeid"}
            >
              Arbeid
            </button>
            <button
              role="button"
              className={classNames(styles.timeType, styles.aktivitetTypeSyk)}
              onClick={() => setValgtAktivitet("sykdom")}
              hidden={!!valgtAktivitet && valgtAktivitet !== "sykdom"}
            >
              Syk
            </button>
            <button
              className={classNames(styles.timeType, styles.aktivitetTypeFerie)}
              onClick={() => setValgtAktivitet("ferie")}
              hidden={!!valgtAktivitet && valgtAktivitet !== "ferie"}
            >
              Fravær / Ferie
            </button>
          </div>
          <Form method="post">
            <input
              type="text"
              hidden
              name="type"
              defaultValue={valgtAktivitet}
              onChange={() => setValgtAktivitet(valgtAktivitet)}
            />
            <input
              type="text"
              hidden
              name="dato"
              defaultValue={valgtDato}
              onChange={() => setValgtDato(valgtDato)}
            />
            {
              //@ts-ignore
              actionData?.fieldErrors?.type && (
                //@ts-ignore
                <p className="navds-error-message navds-label">{actionData?.fieldErrors?.type}</p>
              )
            }
            {valgtAktivitet && (
              <TextField
                type="text"
                label=""
                inputMode="numeric"
                name="timer"
                defaultValue={timer?.replace(/\./g, ",")}
                // @ts-ignore
                error={actionData?.fieldErrors?.timer}
                onChange={(event) => setValgtDato(event.target.value)}
              />
            )}
            <div className={styles.knappKontainer}>
              <Button variant="tertiary-neutral" onClick={() => setOpen((x) => !x)}>
                Avbryt
              </Button>
              <Button type="submit">Lagre</Button>
            </div>
          </Form>
        </Modal.Content>
      </Modal>
    </div>
  );
}
