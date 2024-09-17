import { ArrowLeftIcon } from "@navikt/aksel-icons";
import { Alert, BodyShort, Button, Checkbox, Heading } from "@navikt/ds-react";
import { PortableText } from "@portabletext/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import React, { useState } from "react";
import invariant from "tiny-invariant";
import { logger } from "~/models/logger.server";
import {
  hentPeriode,
  hentRapporteringsperioder,
  sendInnPeriode,
} from "~/models/rapporteringsperiode.server";
import { resetRapporteringstypeCookie } from "~/models/rapporteringstype.server";
import styles from "~/routes-styles/rapportering.module.css";
import { formaterPeriodeDato, formaterPeriodeTilUkenummer } from "~/utils/dato.utils";
import { samleHtmlForPeriode } from "~/utils/periode.utils";
import { useSanity } from "~/hooks/useSanity";
import { useTypedRouteLoaderData } from "~/hooks/useTypedRouteLoaderData";
import { AktivitetOppsummering } from "~/components/aktivitet-oppsummering/AktivitetOppsummering";
import {
  AvregistertArbeidssokerAlert,
  RegistertArbeidssokerAlert,
} from "~/components/arbeidssokerregister/ArbeidssokerRegister";

// TODO: Denne er lik som i periode.$rapporteringsperiodeId.endring.send-inn.tsx
export async function loader({ request }: LoaderFunctionArgs) {
  const rapporteringsperioderResponse = await hentRapporteringsperioder(request);

  if (!rapporteringsperioderResponse.ok) {
    throw new Response("Feil i uthenting av rapporteringsperiode", { status: 500 });
  }

  const rapporteringsperioder = await rapporteringsperioderResponse.json();

  return json({ rapporteringsperioder });
}

export async function action({ request, params }: ActionFunctionArgs) {
  invariant(params.rapporteringsperiodeId, "params.rapporteringsperiode er påkrevd");

  const periodeId = params.rapporteringsperiodeId;

  const periodeResponse = await hentPeriode(request, periodeId, false);
  const periode = await periodeResponse.json();

  const response = await sendInnPeriode(request, periode);

  if (response.ok) {
    return redirect(`/periode/${periodeId}/bekreftelse`, {
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
  const submit = useSubmit();
  const navigation = useNavigation();
  const navigate = useNavigate();

  const [confirmed, setConfirmed] = useState<boolean | undefined>();

  const { periode } = useTypedRouteLoaderData("routes/periode.$rapporteringsperiodeId");
  const { rapporteringsperioder } = useLoaderData<typeof loader>();

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

  const addHtml = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const html = samleHtmlForPeriode(rapporteringsperioder, periode, getAppText, getRichText);
    formData.set("_html", html);

    submit(formData, { method: "post" });
  };

  return (
    <div className="rapportering-container">
      <Heading tabIndex={-1} level="2" size="large" spacing className="vo-fokus">
        {getAppText("rapportering-send-inn-tittel")}
      </Heading>

      <PortableText value={getRichText("rapportering-send-inn-innhold")} />

      <div className="my-4">
        <Heading size="xsmall">{getAppText("rapportering-send-inn-periode-tittel")}</Heading>
        <BodyShort size="small">{invaerendePeriodeTekst}</BodyShort>
      </div>

      <AktivitetOppsummering rapporteringsperiode={periode} />

      {periode.registrertArbeidssoker ? (
        <RegistertArbeidssokerAlert />
      ) : (
        <AvregistertArbeidssokerAlert />
      )}

      <Checkbox onChange={() => setConfirmed((prev) => !prev)}>
        {getAppText("rapportering-send-inn-bekreft-opplysning")}
      </Checkbox>

      {actionData?.error && (
        <Alert variant="error" className={styles.feilmelding}>
          {actionData.error}
        </Alert>
      )}

      <Form method="post" onSubmit={addHtml} className="navigasjon-container-to-knapper my-4">
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
          disabled={!confirmed || isSubmitting}
          className="py-4 px-8"
          name="_action"
          value="send-inn"
        >
          {isSubmitting
            ? getAppText("rapportering-periode-send-inn-bekreft-loading")
            : getLink("rapportering-periode-send-inn-bekreft").linkText}
        </Button>
      </Form>
    </div>
  );
}
