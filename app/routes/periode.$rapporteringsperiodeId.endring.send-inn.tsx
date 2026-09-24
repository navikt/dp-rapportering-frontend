import { ArrowLeftIcon } from "@navikt/aksel-icons";
import { Alert, Button, Checkbox, Heading } from "@navikt/ds-react";
import { useEffect, useMemo, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { data, redirect } from "react-router";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
  useRouteLoaderData,
  useSubmit,
} from "react-router";
import invariant from "tiny-invariant";
import { uuidv7 } from "uuidv7";

import { InnsendingsStatusBeskjed } from "~/components/beskjeder/InnsendingsStatusBeskjed";
import { MeldekortDetaljer } from "~/components/meldekort-detaljert/MeldekortDetaljer";
import { PortableTextRenderer } from "~/components/portable-text/PortableTextRenderer";
import { ReactLink } from "~/components/ReactLink";
import { useAnalytics } from "~/hooks/useAnalytics";
import { useLocale } from "~/hooks/useLocale";
import { useSanity } from "~/hooks/useSanity";
import { useTypedRouteLoaderData } from "~/hooks/useTypedRouteLoaderData";
import { getErrorResponse, logErrorResponse, logg } from "~/models/logger.server";
import {
  hentPeriode,
  hentRapporteringsperioder,
  sendInnPeriode,
} from "~/models/rapporteringsperiode.server";
import type { loader as RootLoader } from "~/root";
import { getCorrelationId } from "~/utils/fetch.utils";
import { useAddHtml } from "~/utils/journalforing.utils";
import { sanityRichText, sanityTekst } from "~/utils/sanity.utils";
import { IRapporteringsperiodeStatus } from "~/utils/types";
import { useIsSubmitting } from "~/utils/useIsSubmitting";

import rootStyles from "../styles/root.module.css";
import styles from "../styles/send-inn.module.css";

export async function loader({ request }: LoaderFunctionArgs) {
  const rapporteringsperioder = await hentRapporteringsperioder(request);

  return { rapporteringsperioder };
}

export async function action({ request, params }: ActionFunctionArgs) {
  invariant(params.rapporteringsperiodeId, "rapportering-feilmelding-periode-id-mangler-i-url");

  const periodeId = params.rapporteringsperiodeId;

  try {
    const { periode } = await hentPeriode(request, periodeId, false, "action-endring-send-inn");

    if (!periode.kanSendes && periode.status === IRapporteringsperiodeStatus.Innsendt) {
      logg({
        type: "warn",
        message: `Feil i innsending av endring: endringen er allerede innsendt, ID: ${periodeId}`,
        correlationId: getCorrelationId(request.headers),
        body: periode,
      });

      return redirect(`/periode/${periodeId}/endring/bekreftelse`);
    } else if (!periode.kanSendes) {
      logg({
        type: "error",
        message: `Feil i innsending av endring: endringen kan ikke sendes inn, ID: ${periodeId}`,
        correlationId: getCorrelationId(request.headers),
        body: periode,
      });

      return data({ error: "rapportering-feilmelding-kan-ikke-sendes" }, { status: 400 });
    }
    const response = await sendInnPeriode(request, periode);
    const { id } = response;
    return redirect(`/periode/${id}/endring/bekreftelse`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      logg({
        type: "error",
        message: `Feil i innsending av endring, ID: ${periodeId}`,
        correlationId: getCorrelationId(request.headers),
        body: {
          message: error.message,
          cause: error.cause,
          stack: error.stack,
        },
      });
    } else if (error instanceof Response) {
      const errorResponse = await getErrorResponse(error);
      logErrorResponse(errorResponse, `Klarte ikke å sende inn endring, ID: ${periodeId}`);
    } else {
      logg({
        type: "error",
        message: `Ukjent feil i innsending av endring, ID: ${periodeId}`,
        correlationId: getCorrelationId(request.headers),
        body: error,
      });
    }

    return data(
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
  const submit = useSubmit();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const isSubmitting = useIsSubmitting(navigation);

  const [confirmed, setConfirmed] = useState<boolean | undefined>();
  const [hasTrackedError, setHasTrackedError] = useState(false);

  const { locale } = useLocale();
  const { periode } = useTypedRouteLoaderData("routes/periode.$rapporteringsperiodeId");
  const { rapporteringsperioder } = useLoaderData<typeof loader>();
  const rootData = useRouteLoaderData<typeof RootLoader>("root");
  const seOver = rootData?.sanityTekst?.utfylling?.seOver;
  const knapper = rootData?.sanityTekst?.knapper;

  const actionData = useActionData<typeof action>();
  const { getAppText, getRichText } = useSanity();

  const { trackSkjemaStegStartet, trackSkjemaStegFullført, trackSkjemaInnsendingFeilet } =
    useAnalytics();
  const sesjonId = useMemo(uuidv7, [periode.id]);
  const stegnavn = "endring-oppsummering";
  const steg = 3;

  const addHtml = useAddHtml({
    rapporteringsperioder,
    periode,
    getAppText,
    getRichText,
    nySanityTexts: rootData?.sanityTekst,
    disableSpm5: rootData?.disableSpm5,
    submit,
    locale,
  });

  const isSubmitDisabled = !periode.kanSendes || !confirmed || isSubmitting;
  const errorMessage = actionData?.error ? getAppText(actionData.error) : null;

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
    trackSkjemaStegStartet({
      periode,
      stegnavn,
      steg,
      sesjonId,
    });
  }, []);

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

  return (
    <Form method="post" onSubmit={onSubmit} className={styles.formContentWrapper}>
      <InnsendingsStatusBeskjed periode={periode} endring visMeldekortetErIkkeSendtInnBeskjed />

      <div className={rootStyles.textWrapper}>
        <Heading tabIndex={-1} size="medium" level="2" className="vo-fokus">
          {sanityTekst(seOver?.sidetittel, "utfylling.seOver.sidetittel")}
        </Heading>
        <PortableTextRenderer
          value={sanityRichText(seOver?.beskrivelse, "utfylling.seOver.beskrivelse")}
        />
      </div>

      <MeldekortDetaljer periode={periode} />

      <Checkbox onChange={() => setConfirmed((prev) => !prev)}>
        {sanityTekst(seOver?.jegHarSettOverBeskjed, "utfylling.seOver.jegHarSettOverBeskjed")}
      </Checkbox>

      {errorMessage && (
        <Alert role="alert" variant="error">
          {errorMessage}
        </Alert>
      )}

      <div className={rootStyles.buttonsContainerRow}>
        <Button
          type="button"
          onClick={() => navigate(-1)}
          variant="secondary"
          iconPosition="left"
          icon={<ArrowLeftIcon aria-hidden />}
        >
          {knapper?.tilbake}
        </Button>

        <Button
          type="submit"
          variant="primary"
          iconPosition="right"
          loading={isSubmitting}
          disabled={isSubmitDisabled}
          name="_action"
          value="send-inn"
        >
          {knapper?.sendEndring}
        </Button>
      </div>

      <ReactLink as="Button" to="/innsendt" variant="tertiary" className="px-8">
        {knapper?.avbryt}
      </ReactLink>
    </Form>
  );
}
