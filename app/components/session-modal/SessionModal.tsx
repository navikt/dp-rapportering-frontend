import { Button, Modal } from "@navikt/ds-react";
import { useEffect, useState } from "react";
import { useSanity } from "~/hooks/useSanity";
import { useTypedRouteLoaderData } from "~/hooks/useTypedRouteLoaderData";
import styles from "./SessionModal.module.css";

export function SessionModal() {
  const { getAppText } = useSanity();
  const [open, setOpen] = useState(false);
  const { session } = useTypedRouteLoaderData("routes/_index");
  const [timeLeft, setTimeLeft] = useState<number | undefined>();
  const [isNagivating, setNavigating] = useState(false);

  useEffect(() => {
    if (session.status === "error") {
      setTimeLeft(1);
      setOpen(true);
    }

    if (session.status === "success" && session?.data?.expiresIn) {
      setTimeLeft(session?.data?.expiresIn);
    }
  }, [session, session?.status]);

  useEffect(() => {
    if (!timeLeft) return;

    if (timeLeft <= 1) {
      setOpen(true);
    }

    const intervalId = setInterval(() => {
      if (timeLeft >= 1) {
        setTimeLeft(timeLeft - 1);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft]);

  function login() {
    window.location.reload();
  }

  function nagivateToNavHomePage() {
    setNavigating(true);
    window.location.replace("https://nav.no/");
  }

  return (
    <>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        header={{
          heading: getAppText("utlopt-sessjon.modal-tittel"),
          size: "medium",
          closeButton: false,
        }}
        width="medium"
      >
        <Modal.Body>
          {getAppText("utlopt-sessjon.modal-detaljer")}
          <div className={styles.actionButtonsContainer}>
            <Button variant={"primary"} onClick={login}>
              {getAppText("utlopt-sessjon.logg-inn-pa-nytt.knapp-tekst")}
            </Button>
            <Button variant={"tertiary"} onClick={nagivateToNavHomePage} loading={isNagivating}>
              {getAppText("utlopt-sessjon.ga-til-forsiden.knapp-tekst")}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
