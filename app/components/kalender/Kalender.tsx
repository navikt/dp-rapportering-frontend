import { Button, Heading, Modal } from "@navikt/ds-react";
import classNames from "classnames";
import { useEffect, useState } from "react";
import { RemixLink } from "../RemixLink";

import styles from "./Kalender.module.css";
import { Form } from "@remix-run/react";
import { periodeMock } from "~/mocks/periodeMock";

export function Kalender() {
  const periode = periodeMock;
  const ukedager = ["man", "tir", "ons", "tor", "fre", "lør", "søn"];
  const helgIndex = [5, 6, 12, 13];
  const [valgtAktivitet, setValgtAktivitet] = useState<string | undefined>(undefined);
  const [valgtDato, setValgtDato] = useState<string | undefined>(undefined);

  const [open, setOpen] = useState(false);
  const [modalHeaderTekst, setModalHeaderTekst] = useState("");

  useEffect(() => {
    Modal.setAppElement("#dp-rapportering-frontend");
  }, []);

  function hentUkedagTekstMedDatoIndex(index: number) {
    switch (index) {
      case 0:
      case 7:
        return "Mandag";
      case 1:
      case 8:
        return "Tirsdag";
      case 2:
      case 9:
        return "Onsdag";
      case 3:
      case 10:
        return "Torsdag";
      case 4:
      case 11:
        return "Fredag";
      case 5:
      case 12:
        return "Lørdag";
      case 6:
      case 13:
        return "Søndag";
    }
  }

  function aapneModal(dato: string, datoIndex: number) {
    setValgtAktivitet(undefined);
    setValgtDato(dato);

    setOpen(true);

    const ukedag = hentUkedagTekstMedDatoIndex(datoIndex);
    setModalHeaderTekst(`${ukedag} ${dato.split("-")[2]}`);
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
              <p>{dag.dato.split("-")[2]}</p>.
            </button>
          );
        })}
      </div>
      <Modal
        open={open}
        aria-label="Modal demo"
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
              className={classNames(styles.timeType, styles.fargekodeArbeid)}
              onClick={() => setValgtAktivitet("arbeid")}
              hidden={!!valgtAktivitet && valgtAktivitet !== "arbeid"}
            >
              Arbeid
            </button>
            <button
              role="button"
              className={classNames(styles.timeType, styles.fargekodeSyk)}
              onClick={() => setValgtAktivitet("sykdom")}
              hidden={!!valgtAktivitet && valgtAktivitet !== "sykdom"}
            >
              Syk
            </button>
            <button
              className={classNames(styles.timeType, styles.fargekodeFravaerFerie)}
              onClick={() => setValgtAktivitet("ferie")}
              hidden={!!valgtAktivitet && valgtAktivitet !== "ferie"}
            >
              Fravær / Ferie
            </button>
          </div>
          <Form method={"POST"}>
            <input type="text" hidden name="type" value={valgtAktivitet} />
            <input type="text" hidden name="dato" value={valgtDato} />
            <input type="text" hidden={!valgtAktivitet} inputMode="decimal" name="timer" />
            <div className={styles.knappKontainer}>
              <RemixLink
                to=""
                as="Button"
                variant="tertiary-neutral"
                onClick={() => setOpen((x) => !x)}
              >
                Avbryt
              </RemixLink>
              <Button type="submit">Lagre</Button>
            </div>
          </Form>
        </Modal.Content>
      </Modal>
    </div>
  );
}
