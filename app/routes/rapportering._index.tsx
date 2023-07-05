import { ArrowLeftIcon, ArrowRightIcon } from "@navikt/aksel-icons";
import { Alert, Button, Heading, Modal } from "@navikt/ds-react";
import { redirect, type ActionArgs, json } from "@remix-run/node";
import { Form, useActionData, useRouteLoaderData } from "@remix-run/react";
import { isFriday, isPast, isToday } from "date-fns";
import { useEffect, useState } from "react";
import { RemixLink } from "~/components/RemixLink";
import { AktivitetModal } from "~/components/aktivitet-modal/AktivitetModal";
import { AktivitetOppsummering } from "~/components/aktivitet-oppsummering/AktivitetOppsummering";
import { Kalender } from "~/components/kalender/Kalender";
import { useSanity } from "~/hooks/useSanity";
import { type IRapporteringLoader } from "./rapportering";
import { lagreAktivitetAction, slettAktivitetAction } from "~/utils/aktivitet.action.server";
import {
  startKorrigering,
  type IRapporteringsperiode,
  avgodkjennPeriode,
} from "~/models/rapporteringsperiode.server";

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

    case "start-korrigering": {
      const periodeId = formdata.get("periode-id") as string;

      console.log("før korrigeringResponse");

      const korrigeringResponse = await startKorrigering(periodeId, request);
      console.log("etter korrigeringResponse", korrigeringResponse);

      if (korrigeringResponse.ok) {
        const korrigeringsperiode: IRapporteringsperiode = await korrigeringResponse.json();
        return redirect(`/rapportering/endre/${korrigeringsperiode.id}`);
      } else {
        json({ korrigeringsfeil: true });
      }
    }

    case "avgodkjenn": {
      const periodeId = formdata.get("periode-id") as string;

      return await avgodkjennPeriode(periodeId, request);
    }
  }
}

export default function Rapportering() {
  const { rapporteringsperiode, allePerioder } = useRouteLoaderData(
    "routes/rapportering"
  ) as IRapporteringLoader;
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

  // Vet ikke om det er slik det skal være, vi må finne ut av det
  // Her burde det være en del av periode responsen fra backend
  // {   .... klarForGodkjenning: boolean;}
  function kanGodkjenne(): boolean {
    // Hente ut siste fredag fra gjeldende periode
    const sisteFredag = rapporteringsperiode.dager
      .filter((dag) => isFriday(new Date(dag.dato)))
      .slice(-1)[0];

    // Bruk f.eks denne om du ønsker å teste en annen dag. Eks første mandag i rapporteringsperioden
    // const sisteFredag = rapporteringsperiode.dager.filter((dag) => isMonday(new Date(dag.dato)))[0];
    return isToday(new Date(sisteFredag.dato)) || isPast(new Date(sisteFredag.dato));
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
          to={
            // kanGodkjenne() ? "/rapportering/send-inn" : "/rapportering/send-inn-ikke-tilgjengelig"
            true ? "/rapportering/send-inn" : "/rapportering/send-inn-ikke-tilgjengelig"
          }
          as="Button"
          variant="primary"
          icon={<ArrowRightIcon fontSize="1.5rem" />}
          iconPosition="right"
        >
          Neste steg
        </RemixLink>
      </div>

      <ul>
        {allePerioder &&
          allePerioder.map((periode: IRapporteringsperiode) => (
            <li key={periode.id}>
              {periode.fraOgMed} {periode.tilOgMed} - {periode.status} ({periode.id})
              <Form method="post">
                <input type="hidden" name="periode-id" value={periode.id}></input>
                {periode.status === "TilUtfylling" && (
                  <RemixLink as="Button" to={`/rapportering/endre/${periode.id}`}>
                    Fyll ut
                  </RemixLink>
                )}
                {periode.status === "Godkjent" && (
                  <Button type="submit" name="submit" value="avgodkjenn">
                    Lås opp og rediger
                  </Button>
                )}
                {periode.status === "Innsendt" && (
                  <Button type="submit" name="submit" value="start-korrigering">
                    Korriger
                  </Button>
                )}
              </Form>
            </li>
          ))}
      </ul>
    </>
  );
}
