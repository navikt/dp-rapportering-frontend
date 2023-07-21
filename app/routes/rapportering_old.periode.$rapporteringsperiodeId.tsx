import { ArrowLeftIcon, ArrowRightIcon } from "@navikt/aksel-icons";
import { Accordion, Alert, Heading, Modal } from "@navikt/ds-react";
import { json, type ActionArgs, redirect, LoaderArgs } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useRouteLoaderData } from "@remix-run/react";
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
import { type IRapporteringLoader } from "./rapportering-old";

import styles from "./rapportering.module.css";
import {
  avGodkjennPeriode,
  hentAllePerioder,
  hentGjeldendePeriode,
  hentPeriode,
  IRapporteringsperiode,
  IRapporteringsperiodeDag,
  lagKorrigeringsperiode,
} from "~/models/rapporteringsperiode.server";
import { getSession } from "~/utils/auth.utils.server";
import invariant from "tiny-invariant";
import { DevelopmentKontainer } from "~/components/development-kontainer/DevelopmentKontainer";

export async function action({ request }: ActionArgs) {
  const formdata = await request.formData();
  const submitKnapp = formdata.get("submit");

  switch (submitKnapp) {
    case "slette": {
      console.log("prøver å slette fra spesifikk rapporteringsperiode");
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

      return json({ lagret: true });
    }
    case "avgodkjenn": {
      const rapporteringsperiodeId = formdata.get("rapporteringsperiodeId") as string;

      const avGodkjennPeriodeResponse = await avGodkjennPeriode(rapporteringsperiodeId, request);

      if (!avGodkjennPeriodeResponse.ok) {
        return json({ error: "Det har skjedd en feil ved avgodkjenning, prøv igjen." });
      }

      return {};
    }

    case "start-korrigering": {
      const rapporteringsperiodeId = formdata.get("rapporteringsperiodeId") as string;
      const response = await lagKorrigeringsperiode(rapporteringsperiodeId, request);

      if (response.ok) {
        const korrigeringsperiode: IRapporteringsperiode = await response.json();
        console.log(korrigeringsperiode);
        return redirect(`/rapportering/periode/${korrigeringsperiode.id}`);
      } else {
        throw new Error("Klarte ikke starte korrigering");
      }
    }

    case "lagre": {
      console.log("prøver å lagre fra spesifikk rapporteringsperiode");

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

export async function loader({ params, request }: LoaderArgs) {
  const session = await getSession(request);
  invariant(params.rapporteringsperiodeId, `params.rapporteringsperiode er påkrevd`);

  // Denne gjelder bare lokalt, DEV og PROD håndteres av wonderwall
  if (session.expiresIn === 0) {
    return json({ rapporteringsperiode: null, session, error: null });
  }

  let periode = null;
  let error = null;

  const PeriodeResponse = await hentPeriode(request, params.rapporteringsperiodeId);

  if (PeriodeResponse.ok) {
    periode = await PeriodeResponse.json();
  } else {
    const { status, statusText } = PeriodeResponse;
    error = { status, statusText };
  }

  const rapporteringsperiode = periode;

  return json({ rapporteringsperiode, error });
}

export default function Rapportering() {
  const { rapporteringsperiode } = useLoaderData<typeof loader>() as IRapporteringLoader;
  const actionData = useActionData();

  const [valgtDato, setValgtDato] = useState<string | undefined>(undefined);
  const [valgtAktivitet, setValgtAktivitet] = useState<TAktivitetType | string>("");
  const [modalAapen, setModalAapen] = useState(false);
  const [muligeAktiviteter, setMuligeAktiviteter] = useState<TAktivitetType[]>([]);
  const [valgtDag, setValgtDag] = useState<IRapporteringsperiodeDag | undefined>(undefined);
  const { hentAppTekstMedId } = useSanity();

  useEffect(() => {
    Modal.setAppElement("#dp-rapportering-frontend");
  }, []);

  useEffect(() => {
    setMuligeAktiviteter(
      rapporteringsperiode.dager.find((r) => r.dato === valgtDato)?.muligeAktiviteter || []
    );
  }, [rapporteringsperiode, valgtDato]);

  useEffect(() => {
    if (actionData?.lagret) {
      lukkModal();
    }
  }, [actionData]);

  function aapneModal(dato: string) {
    if (rapporteringsperiode.status === "TilUtfylling") {
      setValgtDato(dato);
      setValgtDag(rapporteringsperiode.dager.find((dag) => dag.dato === dato));
      setModalAapen(true);
    }
  }

  function lukkModal() {
    setValgtAktivitet("");
    setValgtDato(undefined);
    setValgtDag(undefined);
    setModalAapen(false);
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
      {rapporteringsperiode.status === "Innsendt" && (
        <>
          <Heading level="2" size="large" spacing>
            Tidligere rapportert periode
          </Heading>
          <Alert variant={"info"} className="my-6">
            Rapporteringsperioden er sendt inn og beregnet. Hvis du ønsker å korrigere informasjonen
            kan du trykke på knappen merket "Korriger". Du kan korrigere rapporteringer intill X
            antall uker tilbake i tid. Endringer i rapportering vil føre til at NAV beregner
            periodene på nytt. Dette kan få konsekvenser for utbetaling eller tibakekreving av
            penger.
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
              <button type="submit" name="submit" value="start-korrigering">
                Korriger
              </button>
            </Form>
          </Alert>
        </>
      )}

      <Kalender rapporteringsperiode={rapporteringsperiode} aapneModal={aapneModal} />

      <AktivitetModal
        rapporteringsperiodeDag={valgtDag}
        valgtDato={valgtDato}
        valgtAktivitet={valgtAktivitet}
        setValgtAktivitet={setValgtAktivitet}
        modalAapen={modalAapen}
        setModalAapen={setModalAapen}
        lukkModal={lukkModal}
        muligeAktiviteter={muligeAktiviteter}
      />

      <div className={styles.registertMeldeperiodeKontainer}>
        <AktivitetOppsummering rapporteringsperiode={rapporteringsperiode} />
      </div>

      <div className={styles.navigasjonKontainer}>
        <RemixLink to="" as="Button" variant="secondary" icon={<ArrowLeftIcon fontSize="1.5rem" />}>
          Mine side
        </RemixLink>
        <RemixLink
          to={
            // kanGodkjenne() ? "/rapportering/send-inn" : "/rapportering/send-inn-ikke-tilgjengelig"
            true
              ? `/rapportering/send-inn/${rapporteringsperiode.id}`
              : "/rapportering/send-inn-ikke-tilgjengelig"
          }
          as="Button"
          variant="primary"
          icon={<ArrowRightIcon fontSize="1.5rem" />}
          iconPosition="right"
        >
          Neste steg
        </RemixLink>
      </div>
      <DevelopmentKontainer>
        <Accordion>
          <Accordion.Item>
            <Accordion.Header>(DEBUG) Rapporteringsperiode som json:</Accordion.Header>
            <Accordion.Content>
              <pre>${JSON.stringify(rapporteringsperiode, null, 2)}</pre>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion>
      </DevelopmentKontainer>
    </>
  );
}
