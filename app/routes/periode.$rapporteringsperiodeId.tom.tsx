import { ArrowLeftIcon, ArrowRightIcon } from "@navikt/aksel-icons";
import { Alert, Heading } from "@navikt/ds-react";
import { PortableText } from "@portabletext/react";
import { useNavigate } from "@remix-run/react";
import { useSanity } from "~/hooks/useSanity";
import { useTypedRouteLoaderData } from "~/hooks/useTypedRouteLoaderData";
import { KanIkkeSendes } from "~/components/KanIkkeSendes/KanIkkeSendes";
import { RemixLink } from "~/components/RemixLink";

export default function TomRapporteringsPeriodeSide() {
  const { periode } = useTypedRouteLoaderData("routes/periode.$rapporteringsperiodeId");
  const { getAppText, getRichText, getLink } = useSanity();

  const navigate = useNavigate();
  return (
    <>
      <KanIkkeSendes periode={periode} />

      <Alert variant="info" className="alert-with-rich-text">
        <Heading spacing size="small" level="3">
          {getAppText("rapportering-tom-periode-tittel")}
        </Heading>
        <PortableText value={getRichText("rapportering-tom-periode-innhold")} />
      </Alert>

      <div className="my-8">
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
          className="navigasjonsknapp"
        >
          {getLink("rapportering-periode-send-inn-tilbake").linkText}
        </RemixLink>

        <RemixLink
          as="Button"
          to={`/periode/${periode.id}/arbeidssoker`}
          variant="primary"
          iconPosition="right"
          icon={<ArrowRightIcon aria-hidden />}
          className="navigasjonsknapp"
        >
          {getAppText("rapportering-knapp-neste")}
        </RemixLink>
      </div>
    </>
  );
}
