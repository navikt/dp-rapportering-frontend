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
  useRevalidator,
  useSubmit,
} from "@remix-run/react";
import { useEffect, useMemo, useState } from "react";
import invariant from "tiny-invariant";
import { uuidv7 } from "uuidv7";

import { AktivitetOppsummering } from "~/components/aktivitet-oppsummering/AktivitetOppsummering";
import { ArbeidssokerAlert } from "~/components/arbeidssokerregister/ArbeidssokerRegister";
import { Kalender } from "~/components/kalender/Kalender";
import { KanIkkeSendes } from "~/components/kan-ikke-sendes/KanIkkeSendes";
import navigasjonStyles from "~/components/navigasjon-container/NavigasjonContainer.module.css";
import { useAnalytics } from "~/hooks/useAnalytics";
import { useLocale } from "~/hooks/useLocale";
import { useSanity } from "~/hooks/useSanity";
import { useTypedRouteLoaderData } from "~/hooks/useTypedRouteLoaderData";
import { logg } from "~/models/logger.server";
import {
  hentPeriode,
  hentRapporteringsperioder,
  sendInnPeriode,
} from "~/models/rapporteringsperiode.server";
import { formaterPeriodeDato, formaterPeriodeTilUkenummer } from "~/utils/dato.utils";
import { getCorralationId } from "~/utils/fetch.utils";
import { useAddHtml } from "~/utils/journalforing.utils";
import { kanSendes } from "~/utils/periode.utils";
import { IRapporteringsperiodeStatus } from "~/utils/types";
import { useIsSubmitting } from "~/utils/useIsSubmitting";

import styles from "../styles/send-inn.module.css";

export async function loader({ request }: LoaderFunctionArgs) {
  const rapporteringsperioder = await hentRapporteringsperioder(request);

  return { rapporteringsperioder };
}

export async function action({ request, params }: ActionFunctionArgs) {
  invariant(params.rapporteringsperiodeId, "rapportering-feilmelding-periode-id-mangler-i-url");

  const periodeId = params.rapporteringsperiodeId;

  try {
    const { periode, response } = await hentPeriode(request, periodeId, false, "action-send-inn");

    if (!periode.kanSendes && periode.status === IRapporteringsperiodeStatus.Innsendt) {
      logg({
        type: "warn",
        message: `Feil i innsending av periode: perioden er allerede innsendt, ID: ${periodeId}`,
        correlationId: getCorralationId(response.headers),
        body: periode,
      });

      return redirect(`/periode/${periodeId}/bekreftelse`);
    } else if (!periode.kanSendes) {
      logg({
        type: "error",
        message: `Feil i innsending av periode: perioden kan ikke sendes inn, ID: ${periodeId}`,
        correlationId: getCorralationId(response.headers),
        body: periode,
      });

      return json({ error: "rapportering-feilmelding-kan-ikke-sendes" }, { status: 400 });
    }

    const innsendtPeriode = await sendInnPeriode(request, periode);
    const { id } = innsendtPeriode;

    return redirect(`/periode/${id}/bekreftelse`);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error: unknown) {
    return json(
      {
        error: "rapportering-feilmelding-feil-ved-innsending",
      },
      {
        status: 500,
      },
    );
  }
}

export default function RapporteringsPeriodeSendInnSide() {
  const { locale } = useLocale();
  const [hasTrackedError, setHasTrackedError] = useState(false);

  const { periode } = useTypedRouteLoaderData("routes/periode.$rapporteringsperiodeId");
  const { rapporteringsperioder } = useLoaderData<typeof loader>();

  const revalidator = useRevalidator();

  const { trackSkjemaStegStartet, trackSkjemaStegFullført, trackSkjemaInnsendingFeilet } =
    useAnalytics();
  const sesjonId = useMemo(uuidv7, [periode.id]);
  const stegnavn = "oppsummering";
  const steg = 5;

  const submit = useSubmit();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const isSubmitting = useIsSubmitting(navigation);

  const [confirmed, setConfirmed] = useState<boolean | undefined>(!kanSendes(periode));

  const actionData = useActionData<typeof action>();
  const { getAppText, getRichText } = useSanity();
  const addHtml = useAddHtml({
    rapporteringsperioder,
    periode,
    getAppText,
    getRichText,
    submit,
    locale,
  });

  let invaerendePeriodeTekst = "";

  if (periode) {
    const ukenummer = formaterPeriodeTilUkenummer(
      periode.periode.fraOgMed,
      periode.periode.tilOgMed,
    );
    const dato = formaterPeriodeDato(periode.periode.fraOgMed, periode.periode.tilOgMed, locale);

    invaerendePeriodeTekst = `${getAppText("rapportering-uke")} ${ukenummer} (${dato})`;
  }

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    trackSkjemaStegFullført({
      periode,
      stegnavn,
      steg,
      sesjonId,
    });

    addHtml(event);
  };

  useEffect(() => {
    if (actionData?.error && !hasTrackedError) {
      trackSkjemaInnsendingFeilet(periode.id, periode.rapporteringstype);
      setHasTrackedError(true);
    }
  }, [
    actionData?.error,
    hasTrackedError,
    periode.id,
    periode.rapporteringstype,
    trackSkjemaInnsendingFeilet,
  ]);

  useEffect(() => {
    if (actionData && !actionData.error) {
      setHasTrackedError(false);
    }
  }, [actionData]);

  useEffect(() => {
    trackSkjemaStegStartet({
      periode,
      stegnavn,
      steg,
      sesjonId,
    });
  }, []);

  useEffect(() => {
    revalidator.revalidate();
  }, []);

  return (
    <>
      <Heading tabIndex={-1} level="2" size="medium" spacing className="vo-fokus">
        {getAppText("rapportering-send-inn-tittel")}
      </Heading>
      {kanSendes(periode) ? (
        <Alert variant="warning" className="my-4 alert-with-rich-text">
          <PortableText value={getRichText("rapportering-meldekort-ikke-sendt-enda")} />
        </Alert>
      ) : (
        <KanIkkeSendes periode={periode} />
      )}
      <PortableText value={getRichText("rapportering-send-inn-innhold")} />
      <div className="my-4">
        <Heading size="xsmall">{getAppText("rapportering-send-inn-periode-tittel")}</Heading>
        <BodyShort size="small">{invaerendePeriodeTekst}</BodyShort>
      </div>
      <div className="oppsummering">
        <Kalender periode={periode} readonly={true} locale={locale} aapneModal={() => {}} />
        <AktivitetOppsummering periode={periode} />
      </div>

      <ArbeidssokerAlert periode={periode} />

      <Checkbox
        disabled={!kanSendes(periode)}
        checked={confirmed}
        onChange={() => setConfirmed((prev) => !prev)}
      >
        {getAppText("rapportering-send-inn-bekreft-opplysning")}
      </Checkbox>
      {actionData?.error && (
        <Alert variant="error" className={styles.feilmelding}>
          {actionData.error}
        </Alert>
      )}
      <Form method="post" onSubmit={onSubmit} className={navigasjonStyles.container}>
        <Button
          onClick={() => navigate(-1)}
          variant="secondary"
          iconPosition="left"
          icon={<ArrowLeftIcon aria-hidden />}
          className={navigasjonStyles.knapp}
        >
          {getAppText("rapportering-knapp-tilbake")}
        </Button>

        <Button
          type="submit"
          variant="primary"
          iconPosition="right"
          disabled={!periode.kanSendes || !confirmed || isSubmitting}
          className={navigasjonStyles.knapp}
          name="_action"
          value="send-inn"
        >
          {isSubmitting
            ? getAppText("rapportering-periode-send-inn-bekreft-loading")
            : getAppText("rapportering-periode-send-inn")}
        </Button>
      </Form>
    </>
  );
}
