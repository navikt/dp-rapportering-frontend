import { ArrowLeftIcon, ArrowRightIcon } from "@navikt/aksel-icons";
import { Alert, Heading } from "@navikt/ds-react";
import { PortableText } from "@portabletext/react";
import { useNavigate } from "@remix-run/react";
import { useSanity } from "~/hooks/useSanity";
import { useTypedRouteLoaderData } from "~/hooks/useTypedRouteLoaderData";
import { RemixLink } from "~/components/RemixLink";
import { KanIkkeSendes } from "~/components/kan-ikke-sendes/KanIkkeSendes";
import { NavigasjonContainer } from "~/components/navigasjon-container/NavigasjonContainer";
import navigasjonStyles from "~/components/navigasjon-container/NavigasjonContainer.module.css";

export default function TomRapporteringsPeriodeSide() {
  const { periode } = useTypedRouteLoaderData("routes/periode.$rapporteringsperiodeId");
  const { getAppText, getRichText, getLink } = useSanity();

  const navigate = useNavigate();
  return (
    <>
      <KanIkkeSendes periode={periode} />

      <Alert variant="info" className="alert-with-rich-text">
        <Heading spacing size="small" level="3">
          {getAppText("rapportering-endre-tom-periode-tittel")}
        </Heading>
        <PortableText value={getRichText("rapportering-endre-tom-periode-innhold")} />
      </Alert>

      <div className="my-8">
        <PortableText value={getRichText("rapportering-endre-tom-ingen-å-rapportere")} />
      </div>

      <NavigasjonContainer>
        <RemixLink
          as="Button"
          to=""
          onClick={() => navigate(-1)}
          variant="secondary"
          iconPosition="left"
          icon={<ArrowLeftIcon aria-hidden />}
          className={navigasjonStyles.knapp}
        >
          {getAppText("rapportering-knapp-tilbake")}
        </RemixLink>

        <RemixLink
          as="Button"
          to="/"
          variant="primary"
          iconPosition="right"
          icon={<ArrowRightIcon aria-hidden />}
          className={navigasjonStyles.knapp}
          disabled={true}
        >
          {getAppText("rapportering-knapp-neste")}
        </RemixLink>
      </NavigasjonContainer>

      <NavigasjonContainer>
        <RemixLink
          as="Button"
          to={getLink("rapportering-endre-avbryt").linkUrl}
          variant="tertiary"
          className="px-8"
        >
          {getLink("rapportering-endre-avbryt").linkText}
        </RemixLink>
      </NavigasjonContainer>
    </>
  );
}
