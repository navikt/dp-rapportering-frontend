import { type SessionWithOboProvider } from "@navikt/dp-auth";
import { Button, Heading, Modal } from "@navikt/ds-react";
import { type SerializeFrom } from "@remix-run/node";
import { useRouteLoaderData } from "@remix-run/react";
import classNames from "classnames";
import { useEffect, useState } from "react";
import { type loader } from "~/routes/rapportering";
import { DevelopmentKontainer } from "../development-kontainer/DevelopmentKontainer";
import styles from "./SessjonModal.module.css";

interface IProps {
  sesjon?: SessionWithOboProvider;
}

export function SessjonModal(props: IProps) {
  const { session } = useRouteLoaderData("routes/rapportering") as SerializeFrom<typeof loader>;
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
        <DevelopmentKontainer>
          <a
            target="_blank"
            rel="noreferrer"
            href="https://wonderwalled-idporten.intern.dev.nav.no/api/obo?aud=dev-gcp:teamdagpenger:dp-rapportering"
          >
            Klikk på lenken for å hente ny token
          </a>
        </DevelopmentKontainer>
      </Modal.Body>
    </Modal>
  );
}
