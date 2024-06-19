import { ArrowLeftIcon } from "@navikt/aksel-icons";
import { Alert, BodyShort, Button, Checkbox, Heading } from "@navikt/ds-react";
import { PortableText } from "@portabletext/react";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useNavigate } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import invariant from "tiny-invariant";
import { logger } from "~/models/logger.server";
import { hentPeriode, sendInnPeriode } from "~/models/rapporteringsperiode.server";
import styles from "~/routes-styles/rapportering.module.css";
import { getRapporteringOboToken } from "~/utils/auth.utils.server";
import { formaterPeriodeDato, formaterPeriodeTilUkenummer } from "~/utils/dato.utils";
import { useSanity } from "~/hooks/useSanity";
import { useSetFokus } from "~/hooks/useSetFokus";
import { useScrollToView } from "~/hooks/useSkrollTilSeksjon";
import { useTypedRouteLoaderData } from "~/hooks/useTypedRouteLoaderData";
import { AktivitetOppsummering } from "~/components/aktivitet-oppsummering/AktivitetOppsummering";
import {
  AvregistertSomArbeidssoker,
  RegistertSomArbeidssoker,
} from "~/components/arbeidssokerregister/ArbeidssokerRegister";

export async function action({ request, params }: ActionFunctionArgs) {
  invariant(params.rapporteringsperiodeId, "params.rapporteringsperiode er påkrevd");

  const periodeId = params.rapporteringsperiodeId;

  const onBehalfOfToken = await getRapporteringOboToken(request);

  const periodeResponse = await hentPeriode(onBehalfOfToken, periodeId);
  const periode = await periodeResponse.json();

  const response = await sendInnPeriode(onBehalfOfToken, periode);

  if (response.ok) {
    return redirect(`/periode/${periodeId}/bekreftelse`);
  } else {
    logger.warn(`Klarte ikke sende inn rapportering med id: ${periodeId}`, {
      statustext: response.statusText,
    });

    return json({ error: "Det har skjedd noe feil med innsendingen din, prøv igjen." });
  }
}

export default function RapporteringsPeriodeSendInnSide() {
  const { periode } = useTypedRouteLoaderData("routes/periode.$rapporteringsperiodeId");

  const actionData = useActionData<typeof action>();
  const { getAppText, getRichText, getLink } = useSanity();

  const sidelastFokusRef = useRef(null);
  const { setFokus } = useSetFokus();
  const { scrollToView } = useScrollToView();

  const navigate = useNavigate();

  const [confirmed, setConfirmed] = useState<boolean | undefined>();

  useEffect(() => {
    scrollToView(sidelastFokusRef);
    setFokus(sidelastFokusRef);
  }, [setFokus, scrollToView]);

  let invaerendePeriodeTekst;

  if (periode) {
    const ukenummer = formaterPeriodeTilUkenummer(
      periode.periode.fraOgMed,
      periode.periode.tilOgMed
    );
    const dato = formaterPeriodeDato(periode.periode.fraOgMed, periode.periode.tilOgMed);

    invaerendePeriodeTekst = `Uke ${ukenummer} (${dato})`;
  }

  return (
    <div className="rapportering-container">
      <Heading
        ref={sidelastFokusRef}
        tabIndex={-1}
        level="2"
        size="large"
        spacing
        className="vo-fokus"
      >
        {getAppText("rapportering-send-inn-tittel")}
      </Heading>

      <PortableText value={getRichText("rapportering-send-inn-innhold")} />

      <div className="my-4">
        <Heading size="xsmall">{getAppText("rapportering-send-inn-periode-tittel")}</Heading>
        <BodyShort size="small">{invaerendePeriodeTekst}</BodyShort>
      </div>

      <AktivitetOppsummering rapporteringsperiode={periode} />

      {periode.registrertArbeidssoker ? (
        <RegistertSomArbeidssoker />
      ) : (
        <AvregistertSomArbeidssoker />
      )}

      <Checkbox onChange={() => setConfirmed((prev) => !prev)}>
        {getAppText("rapportering-send-inn-bekreft-opplysning")}
      </Checkbox>

      {actionData?.error && (
        <Alert variant="error" className={styles.feilmelding}>
          {actionData.error}
        </Alert>
      )}

      <Form method="post" className="navigasjon-container-send-inn my-4">
        <Button
          onClick={() => navigate(-1)}
          variant="secondary"
          iconPosition="left"
          icon={<ArrowLeftIcon aria-hidden />}
          className="py-4 px-8"
        >
          {getLink("rapportering-periode-send-inn-tilbake").linkText}
        </Button>

        <Button
          type="submit"
          variant="primary"
          iconPosition="right"
          disabled={!confirmed}
          className="py-4 px-8"
        >
          {getLink("rapportering-periode-send-inn-bekreft").linkText}
        </Button>
      </Form>
    </div>
  );
}
