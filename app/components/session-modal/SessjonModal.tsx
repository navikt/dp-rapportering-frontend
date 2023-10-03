import type { SessionWithOboProvider } from "@navikt/dp-auth";
import { Button, Heading, Modal } from "@navikt/ds-react";
import classNames from "classnames";
import { useEffect, useState } from "react";
import { useTypedRouteLoaderData } from "~/hooks/useTypedRouteLoaderData";
import styles from "./SessjonModal.module.css";
import { DevelopmentContainer } from "../development-container/DevelopmentContainer";

interface IProps {
  sesjon?: SessionWithOboProvider;
}

export function SessjonModal(props: IProps) {
  const { session } = useTypedRouteLoaderData("routes/rapportering");
  const [utlopesOm, setUtlopesOm] = useState<number | undefined>(
    props.sesjon?.expiresIn || session?.expiresIn || 1
  );
  const [utlopt, setUtlopt] = useState(false);
  const [laster, setLaster] = useState(false);

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
    >
      <Modal.Header closeButton={false}>
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
        <DevelopmentContainer>
          <a
            target="_blank"
            rel="noreferrer"
            href="https://wonderwalled-idporten.intern.dev.nav.no/api/obo?aud=dev-gcp:teamdagpenger:dp-rapportering"
          >
            Klikk på lenken for å hente ny token
          </a>
        </DevelopmentContainer>
      </Modal.Body>
    </Modal>
  );
}
