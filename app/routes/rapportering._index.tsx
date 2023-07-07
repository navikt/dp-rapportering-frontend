import { ArrowLeftIcon, ArrowRightIcon } from "@navikt/aksel-icons";
import { Alert, Heading, Modal } from "@navikt/ds-react";
import { type ActionArgs } from "@remix-run/node";
import { useActionData, useRouteLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { RemixLink } from "~/components/RemixLink";
import { AktivitetModal } from "~/components/aktivitet-modal/AktivitetModal";
import { AktivitetOppsummering } from "~/components/aktivitet-oppsummering/AktivitetOppsummering";
import { Kalender } from "~/components/kalender/Kalender";
import { useSanity } from "~/hooks/useSanity";
import { lagreAktivitetAction, slettAktivitetAction } from "~/utils/aktivitet.action.server";
import { type IRapporteringLoader } from "./rapportering";

import styles from "./rapportering.module.css";

export async function action({ request }: ActionArgs) {
  const formdata = await request.formData();
  const submitKnapp = formdata.get("submit");

  switch (submitKnapp) {
    case "slette": {
      return await slettAktivitetAction(formdata, request);
    }

    case "lagre": {
      return await lagreAktivitetAction(formdata, request);
    }
  }
}

export default function Rapportering() {
  const { rapporteringsperiode } = useRouteLoaderData("routes/rapportering") as IRapporteringLoader;
  const actionData = useActionData();

  const [valgtDato, setValgtDato] = useState<string | undefined>(undefined);
  const [modalAapen, setModalAapen] = useState(false);
  const { hentAppTekstMedId } = useSanity();

  useEffect(() => {
    Modal.setAppElement("#dp-rapportering-frontend");
  }, []);

  useEffect(() => {
    if (actionData?.lagret) {
      lukkModal();
    }
  }, [actionData]);

  function aapneModal(dato: string) {
    setValgtDato(dato);
    setModalAapen(true);
  }

  function lukkModal() {
    setValgtDato(undefined);
    setModalAapen(false);
  }

  return (
    <>
      <Heading level="2" size="large" spacing>
        {hentAppTekstMedId("rapportering-periode-tittel")}
      </Heading>

      {rapporteringsperiode.status === "Godkjent" && (
        <Alert variant="success" className="my-6">
          Du har sendt inn meldekortet! Du trenger ikke gjøre noe mer :)
        </Alert>
      )}

      <Kalender rapporteringsperiode={rapporteringsperiode} aapneModal={aapneModal} />

      <AktivitetModal
        rapporteringsperiode={rapporteringsperiode}
        valgtDato={valgtDato}
        modalAapen={modalAapen}
        lukkModal={lukkModal}
      />

      <AktivitetOppsummering rapporteringsperiode={rapporteringsperiode} />

      <div className={styles.navigasjonKontainer}>
        <RemixLink to="" as="Button" variant="secondary" icon={<ArrowLeftIcon fontSize="1.5rem" />}>
          Mine side
        </RemixLink>
        <RemixLink
          to={true ? "/rapportering/send-inn" : "/rapportering/send-inn-ikke-tilgjengelig"}
          as="Button"
          variant="primary"
          icon={<ArrowRightIcon fontSize="1.5rem" />}
          iconPosition="right"
        >
          Neste steg
        </RemixLink>
      </div>
    </>
  );
}
