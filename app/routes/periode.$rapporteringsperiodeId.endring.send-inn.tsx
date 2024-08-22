import { ArrowLeftIcon } from "@navikt/aksel-icons";
import { Alert, BodyShort, Button, Checkbox, Detail, Heading } from "@navikt/ds-react";
import { PortableText } from "@portabletext/react";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useNavigate, useNavigation } from "@remix-run/react";
import { useState } from "react";
import invariant from "tiny-invariant";
import { logger } from "~/models/logger.server";
import { hentPeriode, sendInnPeriode } from "~/models/rapporteringsperiode.server";
import { resetRapporteringstypeCookie } from "~/models/rapporteringstype.server";
import styles from "~/routes-styles/rapportering.module.css";
import { formaterPeriodeDato, formaterPeriodeTilUkenummer } from "~/utils/dato.utils";
import { useSanity } from "~/hooks/useSanity";
import { useTypedRouteLoaderData } from "~/hooks/useTypedRouteLoaderData";
import { AktivitetOppsummering } from "~/components/aktivitet-oppsummering/AktivitetOppsummering";
import { Kalender } from "~/components/kalender/Kalender";

export async function action({ request, params }: ActionFunctionArgs) {
  invariant(params.rapporteringsperiodeId, "params.rapporteringsperiode er påkrevd");

  const periodeId = params.rapporteringsperiodeId;

  const periodeResponse = await hentPeriode(request, periodeId);
  const periode = await periodeResponse.json();

  const response = await sendInnPeriode(request, periode);

  if (response.ok) {
    const { id } = await response.json();
    return redirect(`/periode/${id}/endring/bekreftelse`, {
      headers: {
        "Set-Cookie": await resetRapporteringstypeCookie(),
      },
    });
  } else {
    logger.warn(`Klarte ikke sende inn rapportering med id: ${periodeId}`, {
      statustext: response.statusText,
    });

    return json(
      {
        error: "Det har skjedd noe feil med innsendingen din, prøv igjen.",
      },
      {
        status: 500,
      }
    );
  }
}

export default function RapporteringsPeriodeSendInnSide() {
  const navigation = useNavigation();
  const navigate = useNavigate();

  const [confirmed, setConfirmed] = useState<boolean | undefined>();

  const { periode } = useTypedRouteLoaderData("routes/periode.$rapporteringsperiodeId");

  const actionData = useActionData<typeof action>();
  const { getAppText, getRichText, getLink } = useSanity();

  let invaerendePeriodeTekst;

  if (periode) {
    const ukenummer = formaterPeriodeTilUkenummer(
      periode.periode.fraOgMed,
      periode.periode.tilOgMed
    );
    const dato = formaterPeriodeDato(periode.periode.fraOgMed, periode.periode.tilOgMed);

    invaerendePeriodeTekst = `Uke ${ukenummer} (${dato})`;
  }

  const isSubmitting =
    navigation.state !== "idle" &&
    navigation.formData &&
    navigation.formData.get("_action") === "send-inn";

  return (
    <div className="rapportering-container">
      <Heading tabIndex={-1} level="2" size="large" spacing className="vo-fokus">
        {getAppText("rapportering-endring-send-inn-tittel")}
      </Heading>

      <PortableText value={getRichText("rapportering-endring-send-inn-innhold")} />

      <div className="my-4">
        <Heading size="xsmall">{getAppText("rapportering-send-inn-periode-tittel")}</Heading>
        <BodyShort size="small">{invaerendePeriodeTekst}</BodyShort>
      </div>

      <Kalender rapporteringsperiode={periode} aapneModal={() => {}} readonly />

      <AktivitetOppsummering rapporteringsperiode={periode} />

      {periode.begrunnelseEndring && (
        <div>
          <Heading size="small" className="my-4">
            {getAppText("rapportering-endring-begrunnelse-tittel")}
          </Heading>

          <Detail weight="semibold" className="ml-4">
            {periode.begrunnelseEndring}
          </Detail>
        </div>
      )}

      <Checkbox onChange={() => setConfirmed((prev) => !prev)}>
        {getAppText("rapportering-endring-send-inn-bekreft-opplysning")}
      </Checkbox>

      {actionData?.error && (
        <Alert variant="error" className={styles.feilmelding}>
          {actionData.error}
        </Alert>
      )}

      <Form method="post" className="navigasjon-container-to-knapper my-4">
        <Button
          onClick={() => navigate(-1)}
          variant="secondary"
          iconPosition="left"
          icon={<ArrowLeftIcon aria-hidden />}
          className="py-4 px-8"
        >
          {getLink("rapportering-knapp-tilbake").linkText}
        </Button>

        <Button
          type="submit"
          variant="primary"
          iconPosition="right"
          disabled={!confirmed || isSubmitting}
          className="py-4 px-8"
          name="_action"
          value="send-inn"
        >
          {isSubmitting
            ? getAppText("rapportering-periode-send-inn-bekreft-loading")
            : getLink("rapportering-endring-send-inn-bekreft").linkText}
        </Button>
      </Form>
    </div>
  );
}
