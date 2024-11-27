import { ArrowLeftIcon, ArrowRightIcon } from "@navikt/aksel-icons";
import { Alert, Button, Heading } from "@navikt/ds-react";
import { PortableText } from "@portabletext/react";
import { useNavigate } from "@remix-run/react";
import { useAmplitude } from "~/hooks/useAmplitude";
import { useSanity } from "~/hooks/useSanity";
import { useTypedRouteLoaderData } from "~/hooks/useTypedRouteLoaderData";
import { RemixLink } from "~/components/RemixLink";
import { KanIkkeSendes } from "~/components/kan-ikke-sendes/KanIkkeSendes";
import { NavigasjonContainer } from "~/components/navigasjon-container/NavigasjonContainer";
import navigasjonStyles from "~/components/navigasjon-container/NavigasjonContainer.module.css";

export default function TomRapporteringsPeriodeSide() {
  const { periode } = useTypedRouteLoaderData("routes/periode.$rapporteringsperiodeId");
  const { getAppText, getRichText } = useSanity();

  const navigate = useNavigate();
  const { trackSkjemaSteg } = useAmplitude();

  const neste = () => {
    trackSkjemaSteg({
      periode,
      stegnavn: "tom",
      steg: 3,
    });

    navigate(`/periode/${periode.id}/arbeidssoker`);
  };
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

        <Button
          size="medium"
          variant="primary"
          iconPosition="right"
          icon={<ArrowRightIcon aria-hidden />}
          className={navigasjonStyles.knapp}
          onClick={neste}
        >
          {getAppText("rapportering-knapp-neste")}
        </Button>
      </NavigasjonContainer>
    </>
  );
}
