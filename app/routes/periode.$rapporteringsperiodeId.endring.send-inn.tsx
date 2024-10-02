import { ArrowLeftIcon } from "@navikt/aksel-icons";
import { Alert, BodyShort, Button, Checkbox, Detail, Heading } from "@navikt/ds-react";
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
import { useState } from "react";
import invariant from "tiny-invariant";
import {
  hentPeriode,
  hentRapporteringsperioder,
  sendInnPeriode,
} from "~/models/rapporteringsperiode.server";
import { formaterPeriodeDato, formaterPeriodeTilUkenummer } from "~/utils/dato.utils";
import { useAddHtml } from "~/utils/journalforing.utils";
import { useIsSubmitting } from "~/utils/useIsSubmitting";
import { useSanity } from "~/hooks/useSanity";
import { useTypedRouteLoaderData } from "~/hooks/useTypedRouteLoaderData";
import { RemixLink } from "~/components/RemixLink";
import { AktivitetOppsummering } from "~/components/aktivitet-oppsummering/AktivitetOppsummering";
import { Kalender } from "~/components/kalender/Kalender";

export async function loader({ request }: LoaderFunctionArgs) {
  const rapporteringsperioder = await hentRapporteringsperioder(request);

  return json({ rapporteringsperioder });
}

export async function action({ request, params }: ActionFunctionArgs) {
  invariant(params.rapporteringsperiodeId, "params.rapporteringsperiode er påkrevd");

  const periodeId = params.rapporteringsperiodeId;

  try {
    const periode = await hentPeriode(request, periodeId, false);
    const response = await sendInnPeriode(request, periode);
    const { id } = response;
    return redirect(`/periode/${id}/endring/bekreftelse`);
  } catch (error: unknown) {
    // TODO: Her ønsker vi å vise en modal, ikke en ny side
    // TODO: Feilen er en network error
    if (error instanceof Response) {
      return json(
        {
          error: "rapportering-feilmelding-feil-ved-innsending",
        },
        {
          status: 500,
        }
      );
    }
  }
}

export default function RapporteringsPeriodeSendInnSide() {
  const submit = useSubmit();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const isSubmitting = useIsSubmitting(navigation);

  const [confirmed, setConfirmed] = useState<boolean | undefined>();

  const { periode } = useTypedRouteLoaderData("routes/periode.$rapporteringsperiodeId");
  const { rapporteringsperioder } = useLoaderData<typeof loader>();

  const actionData = useActionData<typeof action>();
  const { getAppText, getRichText, getLink } = useSanity();

  const addHtml = useAddHtml({ rapporteringsperioder, periode, getAppText, getRichText, submit });

  let invaerendePeriodeTekst;

  if (periode) {
    const ukenummer = formaterPeriodeTilUkenummer(
      periode.periode.fraOgMed,
      periode.periode.tilOgMed
    );
    const dato = formaterPeriodeDato(periode.periode.fraOgMed, periode.periode.tilOgMed);

    invaerendePeriodeTekst = `${getAppText("rapportering-uke")} ${ukenummer} (${dato})`;
  }

  return (
    <>
      <Heading tabIndex={-1} level="2" size="large" spacing className="vo-fokus">
        {getAppText("rapportering-endring-send-inn-tittel")}
      </Heading>

      <PortableText value={getRichText("rapportering-endring-send-inn-innhold")} />

      <div className="my-4">
        <Heading size="xsmall">{getAppText("rapportering-send-inn-periode-tittel")}</Heading>
        <BodyShort size="small">{invaerendePeriodeTekst}</BodyShort>
      </div>

      <div className="oppsummering">
        <Kalender rapporteringsperiode={periode} aapneModal={() => {}} readonly />
        <AktivitetOppsummering rapporteringsperiode={periode} />
      </div>

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
        <Alert variant="error" className="feilmelding">
          {actionData.error}
        </Alert>
      )}

      <Form method="post" onSubmit={addHtml} className="navigasjon-container my-4">
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
      <div className="navigasjon-container my-4">
        <RemixLink
          as="Link"
          to={getLink("rapportering-endre-avbryt").linkUrl}
          variant="primary"
          className="py-4 px-8"
        >
          {getLink("rapportering-endre-avbryt").linkText}
        </RemixLink>
      </div>
    </>
  );
}
