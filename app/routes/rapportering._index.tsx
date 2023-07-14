import { ArrowLeftIcon, ArrowRightIcon } from "@navikt/aksel-icons";
import { Alert, Heading, Modal } from "@navikt/ds-react";
import { json, type ActionArgs } from "@remix-run/node";
import { Form, useActionData, useRouteLoaderData } from "@remix-run/react";
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
import { type IRapporteringLoader } from "./rapportering";

import styles from "./rapportering.module.css";
import { avGodkjennPeriode } from "~/models/rapporteringsperiode.server";

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
        return json({ error: "Det har skjedd en feil ved sletting, prøv igjen." });
      }

      return {};
    }
    case "avgodkjenn": {
      const rapporteringsperiodeId = formdata.get("rapporteringsperiodeId") as string;

      const avGodkjennPeriodeResponse = await avGodkjennPeriode(rapporteringsperiodeId, request);

      if (!avGodkjennPeriodeResponse.ok) {
        return json({ error: "Det har skjedd en feil ved avgodkjenning, prøv igjen." });
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
        const delt = tid.replace(/\./g, ",").split(",");
        const timer = delt[0] || 0;
        const minutter = delt[1] || 0;
        const minutterFloat = parseFloat(`0.${minutter}`);

        return {
          type,
          dato,
          timer: serialize({
            hours: timer,
            minutes: Math.round(minutterFloat * 60),
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
        return json({ error: "Noen gikk feil med lagring av aktivitet, prøv igjen." });
      }

      return json({ lagret: true });
    }
  }
}

export default function Rapportering() {
  const { rapporteringsperiode } = useRouteLoaderData("routes/rapportering") as IRapporteringLoader;
  const actionData = useActionData();

  const [valgtDato, setValgtDato] = useState<string | undefined>(undefined);
  const [valgtAktivitet, setValgtAktivitet] = useState<TAktivitetType | string>("");
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
      {rapporteringsperiode.status === "TilUtfylling" && (
        <>
          <Heading level="2" size="large" spacing>
            {hentAppTekstMedId("rapportering-periode-tittel")}
          </Heading>
          <p>
            Klikk på dagen du ønsker å rapportere for. Du vil da få alternativer for jobb, sykdom,
            fravær og ferie som er det du skal rapportere til NAV.
          </p>
        </>
      )}

      {rapporteringsperiode.status === "Godkjent" && (
        <>
          <Heading level="2" size="large" spacing>
            Tidligere rapportert periode
          </Heading>
          <Alert variant="success" className="my-6">
            Du har sendt inn meldekortet! Du trenger ikke gjøre noe mer :) Hvis du ønsker å endre
            informasjonen i meldekortet husk at du da må sende inn meldekortet på nytt.
            <Form method="post">
              <input
                type="text"
                hidden
                name="rapporteringsperiodeId"
                defaultValue={rapporteringsperiode.id}
              />
              {actionData?.error && (
                <Alert variant="error" className={styles.feilmelding}>
                  {actionData.error}
                </Alert>
              )}
              <button type="submit" name="submit" value="avgodkjenn">
                Endre
              </button>
            </Form>
          </Alert>
        </>
      )}

      <Kalender rapporteringsperiode={rapporteringsperiode} aapneModal={aapneModal} />

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
