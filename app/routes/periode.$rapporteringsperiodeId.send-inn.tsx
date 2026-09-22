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

import { SendestatusBeskjed } from "~/components/beskjeder/SendestatusBeskjed";
import { MeltekortDetaljer } from "~/components/meldekort-detaljert/MeldekortDetaljer";
import { PortableTextRenderer } from "~/components/portable-text/PortableTextRenderer";
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
import type { loader as RootLoader } from "~/root";
import { getCorrelationId } from "~/utils/fetch.utils";
import { useAddHtml } from "~/utils/journalforing.utils";
import { kanSendes } from "~/utils/periode.utils";
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
    const { periode, response } = await hentPeriode(request, periodeId, false, "action-send-inn");

    if (!periode.kanSendes && periode.status === IRapporteringsperiodeStatus.Innsendt) {
      logg({
        type: "warn",
        message: `Feil i innsending av periode: perioden er allerede innsendt, ID: ${periodeId}`,
        correlationId: getCorrelationId(response.headers),
        body: periode,
      });

      return redirect(`/periode/${periodeId}/bekreftelse`);
    } else if (!periode.kanSendes) {
      logg({
        type: "error",
        message: `Feil i innsending av periode: perioden kan ikke sendes inn, ID: ${periodeId}`,
        correlationId: getCorrelationId(response.headers),
        body: periode,
      });

      return data({ error: "rapportering-feilmelding-kan-ikke-sendes" }, { status: 400 });
    }

    const innsendtPeriode = await sendInnPeriode(request, periode);
    const { id } = innsendtPeriode;

    return redirect(`/periode/${id}/bekreftelse`);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error: unknown) {
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
  const { locale } = useLocale();
  const [hasTrackedError, setHasTrackedError] = useState(false);

  const { periode } = useTypedRouteLoaderData("routes/periode.$rapporteringsperiodeId");
  const { rapporteringsperioder } = useLoaderData<typeof loader>();
  const rootData = useRouteLoaderData<typeof RootLoader>("root");

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
    nySanityTexts: rootData?.sanityTekst,
    submit,
    locale,
  });

  const isSubmitDisabled = !periode.kanSendes || !confirmed || isSubmitting;

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

  const errorMessage = actionData?.error ? getAppText(actionData.error) : null;

  return (
    <Form method="post" onSubmit={onSubmit} className={styles.formContentWrapper}>
      <SendestatusBeskjed periode={periode} />

      <div className={rootStyles.textWrapper}>
        <Heading tabIndex={-1} size="medium" className="vo-fokus">
          {getAppText("rapportering-send-inn-tittel")}
        </Heading>
        <PortableTextRenderer value={getRichText("rapportering-send-inn-innhold")} />
      </div>

      <MeltekortDetaljer periode={periode} visArbeidssokerSvar />

      <Checkbox
        disabled={!kanSendes(periode)}
        checked={confirmed}
        onChange={() => setConfirmed((prev) => !prev)}
      >
        {getAppText("rapportering-send-inn-bekreft-opplysning")}
      </Checkbox>

      {errorMessage && (
        <Alert role="alert" variant="error" className={styles.feilmelding}>
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
          {getAppText("rapportering-knapp-tilbake")}
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
          {getAppText("rapportering-periode-send-inn")}
        </Button>
      </div>
    </Form>
  );
}
