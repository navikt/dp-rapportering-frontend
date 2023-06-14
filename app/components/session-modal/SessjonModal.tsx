import { Alert, Button, Heading, Modal } from "@navikt/ds-react";
import { useRouteLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { IRapporteringLoader } from "~/routes/rapportering";
import classNames from "classnames";
import { getEnv } from "~/utils/env.utils";

import styles from "./SessjonModal.module.css";

export function SessjonModal() {
  const { session } = useRouteLoaderData("routes/rapportering") as IRapporteringLoader;
  const [utlopesOm, setUtlopesOm] = useState<number | undefined>(session?.expiresIn || 1);
  const [utlopt, setUtlopt] = useState(false);
  const [laster, setLaster] = useState(false);

  useEffect(() => {
    if (Modal.setAppElement) {
      Modal.setAppElement("#dp-rapportering-frontend");
    }
  }, []);

  useEffect(() => {
    if (!utlopesOm) return;

    if (utlopesOm === 1) {
      setUtlopt(true);
    }

    const intervalId = setInterval(() => {
      setUtlopesOm(utlopesOm - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [utlopesOm]);

  function navigerTilNavHjemmeside() {
    setLaster(true);
    window.location.replace("https://nav.no/");
  }

  return (
    <Modal
      className={classNames("modal-container modal-container--error", styles.sessjonModal)}
      onClose={() => {
        return;
      }}
      open={utlopt}
      closeButton={false}
      shouldCloseOnOverlayClick={false}
    >
      <Modal.Content>
        <Heading spacing level="1" size="medium">
          Du må logge inn på nytt for å fortsette
        </Heading>
        <p>
          Sesjonen din har utløpt, og du må logge inn med BankID på nytt for å fortsette. Alle
          svarene dine i søknaden er lagret og du kan fortsette der du slapp.
        </p>
        <div className={styles.knappKontainer}>
          <Button variant={"primary"} onClick={() => window.location.reload()}>
            Login
          </Button>
          <Button variant={"tertiary"} onClick={navigerTilNavHjemmeside} loading={laster}>
            Gå til forsiden
          </Button>
        </div>
        {getEnv("IS_LOCALHOST") === "true" && (
          <Alert variant="info">
            <a
              target="_blank"
              href="https://wonderwalled-idporten.intern.dev.nav.no/api/obo?aud=dev-gcp:teamdagpenger:dp-rapportering"
            >
              Klikk på lenken for å hente ny token
            </a>
          </Alert>
        )}
      </Modal.Content>
    </Modal>
  );
}
