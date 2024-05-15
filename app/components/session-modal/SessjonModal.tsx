import { Button, Heading, Modal } from "@navikt/ds-react";
import classNames from "classnames";
import { useEffect, useState } from "react";
import { useTypedRouteLoaderData } from "~/hooks/useTypedRouteLoaderData";
import { getEnv } from "~/utils/env.utils";
import styles from "./SessjonModal.module.css";

export function SessjonModal() {
  const { session } = useTypedRouteLoaderData("routes/rapportering");
  const [utlopesOm, setUtlopesOm] = useState<number | undefined>(
    session?.expiresIn || session?.expiresIn || 1
  );
  const [utlopt, setUtlopt] = useState(false);
  const [laster, setLaster] = useState(false);

  useEffect(() => {
    if (!utlopesOm || getEnv("USE_MSW") === "true") return;

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
      aria-labelledby="sessjon-modal-heading"
      className={classNames("modal-container modal-container--error", styles.sessjonModal)}
      onClose={() => {
        return;
      }}
      open={utlopt}
    >
      <Modal.Header id="sessjon-modal-heading" closeButton={false}>
        <Heading level="1" size="medium">
          Du må logge inn på nytt for å fortsette
        </Heading>
      </Modal.Header>
      <Modal.Body>
        <p>
          Sesjonen din har utløpt, og du må logge inn med IDPorten på nytt for å fortsette. Alle
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
      </Modal.Body>
    </Modal>
  );
}
