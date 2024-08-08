import { ArrowLeftIcon, ArrowRightIcon } from "@navikt/aksel-icons";
import { Alert, Heading } from "@navikt/ds-react";
import { PortableText } from "@portabletext/react";
import { useNavigate } from "@remix-run/react";
import { useSanity } from "~/hooks/useSanity";
import { useTypedRouteLoaderData } from "~/hooks/useTypedRouteLoaderData";
import { RemixLink } from "~/components/RemixLink";

export default function TomRapporteringsPeriodeSide() {
  const { periode } = useTypedRouteLoaderData("routes/periode.$rapporteringsperiodeId");
  const { getAppText, getRichText, getLink } = useSanity();

  const navigate = useNavigate();
  return (
    <div className="rapportering-container">
      <Alert variant="info">
        <Heading spacing size="small" level="3">
          {getAppText("rapportering-tom-periode-tittel")}
        </Heading>
        {getAppText("rapportering-tom-periode-innhold")}
      </Alert>

      <div className="my-10">
        <p>{getAppText("rapportering-tom-noe-å-rapportere")}</p>
        <PortableText value={getRichText("rapportering-tom-ingen-å-rapportere")} />
      </div>

      <div className="navigasjon-container-to-knapper my-4">
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
    </div>
  );
}
