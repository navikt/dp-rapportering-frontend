import { ArrowLeftIcon, ArrowRightIcon } from "@navikt/aksel-icons";
import { Alert, Heading } from "@navikt/ds-react";
import { PortableText } from "@portabletext/react";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import invariant from "tiny-invariant";
import { hentPeriode } from "~/models/rapporteringsperiode.server";
import { useSanity } from "~/hooks/useSanity";
import { RemixLink } from "~/components/RemixLink";

export async function loader({ request, params }: LoaderFunctionArgs) {
  invariant(params.rapporteringsperiodeId, "rapportering-feilmelding-periode-id-mangler-i-url");

  const periodeId = params.rapporteringsperiodeId;
  const periode = await hentPeriode(request, periodeId, false);

  return json({ periode });
}

export default function TomRapporteringsPeriodeSide() {
  const { periode } = useLoaderData<typeof loader>();
  const { getAppText, getRichText, getLink } = useSanity();

  const navigate = useNavigate();
  return (
    <>
      {periode.kanSendes === false && (
        <Alert variant="warning">{getAppText("rapportering-periode-kan-ikke-sendes")}</Alert>
      )}
      <Alert variant="info">
        <Heading spacing size="small" level="3">
          {getAppText("rapportering-tom-periode-tittel")}
        </Heading>
        {getAppText("rapportering-tom-periode-innhold")}
      </Alert>

      <div className="my-8">
        <p>{getAppText("rapportering-tom-noe-å-rapportere")}</p>
        <PortableText value={getRichText("rapportering-tom-ingen-å-rapportere")} />
      </div>

      <div className="navigasjon-container my-4">
        <RemixLink
          as="Button"
          to=""
          onClick={() => navigate(-1)}
          variant="secondary"
          iconPosition="left"
          icon={<ArrowLeftIcon aria-hidden />}
          className="py-4 px-8"
        >
          {getLink("rapportering-periode-send-inn-tilbake").linkText}
        </RemixLink>

        <RemixLink
          as="Button"
          to={`/periode/${periode.id}/arbeidssoker`}
          variant="primary"
          iconPosition="right"
          icon={<ArrowRightIcon aria-hidden />}
          className="py-4 px-8"
        >
          {getAppText("rapportering-knapp-neste")}
        </RemixLink>
      </div>
    </>
  );
}
