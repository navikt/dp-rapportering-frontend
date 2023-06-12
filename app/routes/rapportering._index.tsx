import { ArrowLeftIcon, ArrowRightIcon } from "@navikt/aksel-icons";
import { Heading, Modal } from "@navikt/ds-react";
import { json, type ActionArgs } from "@remix-run/node";
import { useActionData, useRouteLoaderData } from "@remix-run/react";
import { isFriday, isPast, isToday } from "date-fns";
import { useEffect, useState } from "react";
import { validationError } from "remix-validated-form";
import { serialize } from "tinyduration";
import { RemixLink } from "~/components/RemixLink";
import { AktivitetModal } from "~/components/aktivitet-modal/AktivitetModal";
import { AktivitetOppsummering } from "~/components/aktivitet-oppsummering/AktivitetOppsummering";
import { Kalender } from "~/components/kalender/Kalender";
import { useSanity } from "~/hooks/useSanity";
import type { TAktivitetType } from "~/models/aktivitet.server";
import { lagreAktivitet, sletteAktivitet } from "~/models/aktivitet.server";
import { validator } from "~/utils/validering.util";
import { IRapporteringLoader } from "./rapportering";

import styles from "./rapportering.module.css";

export async function action({ request }: ActionArgs) {
  const formdata = await request.formData();
  const submitKnapp = formdata.get("submit");

  switch (submitKnapp) {
    case "slette": {
      const rapporteringsperiodeId = formdata.get("rapporteringsperiodeId") as string;
      const aktivitetId = formdata.get("aktivitetId") as string;

      const slettAktivitetResponse = await sletteAktivitet(
        rapporteringsperiodeId,
        aktivitetId,
        request
      );

      if (!slettAktivitetResponse.ok) {
        return json({ error: "Det har skjedd en feil ved sletting, prøv igjen" });
      }

      return {};
    }

    case "lagre": {
      const aktivitType = formdata.get("type") as TAktivitetType;
      const inputVerdier = await validator(aktivitType).validate(formdata);

      if (inputVerdier.error) {
        return validationError(inputVerdier.error);
      }

      const { rapporteringsperiodeId, type, dato, timer: tid } = inputVerdier.submittedData;

      function hentAktivitetArbeid() {
        const delt = tid.split(",");
        const timer = delt[0] || 0;
        const minutter = delt[1] || 0;

        return {
          type,
          dato,
          timer: serialize({
            hours: timer,
            minutes: minutter * 6,
          }),
        };
      }

      const andreAktivitet = {
        type,
        dato,
      };

      const aktivitetData = aktivitType === "Arbeid" ? hentAktivitetArbeid() : andreAktivitet;

      const lagreAktivitetResponse = await lagreAktivitet(
        rapporteringsperiodeId,
        aktivitetData,
        request
      );

      if (!lagreAktivitetResponse.ok) {
        return json({ error: "Neon gikk feil med lagring av aktivitet, prøv igjen." });
      }

      return json({ lagret: true });
    }
  }
}

export default function Rapportering() {
  const { rapporteringsperiode } = useRouteLoaderData("routes/rapportering") as IRapporteringLoader;
  const actionData = useActionData();

  const [valgtDato, setValgtDato] = useState<string | undefined>(undefined);
  const [valgtAktivitet, setValgtAktivitet] = useState("");
  const [modalAapen, setModalAapen] = useState(false);
  const [muligeAktiviteter, setMuligeAktiviteter] = useState<TAktivitetType[]>([]);
  const { hentAppTekstMedId } = useSanity();

  useEffect(() => {
    Modal.setAppElement("#dp-rapportering-frontend");
  }, []);

  useEffect(() => {
    setMuligeAktiviteter(
      rapporteringsperiode.dager.find((r) => r.dato === valgtDato)?.muligeAktiviteter || []
    );
  }, [rapporteringsperiode.dager, valgtDato]);

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
    setValgtAktivitet("");
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

      <Kalender aapneModal={aapneModal} />

      <AktivitetModal
        rapporteringsperiodeId={rapporteringsperiode.id}
        valgtDato={valgtDato}
        valgtAktivitet={valgtAktivitet}
        setValgtAktivitet={setValgtAktivitet}
        modalAapen={modalAapen}
        setModalAapen={setModalAapen}
        lukkModal={lukkModal}
        muligeAktiviteter={muligeAktiviteter}
      />

      <div className={styles.registertMeldeperiodeKontainer}>
        <p>Sammenlagt for meldeperioden:</p>
        <AktivitetOppsummering />
      </div>

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
    </>
  );
}
