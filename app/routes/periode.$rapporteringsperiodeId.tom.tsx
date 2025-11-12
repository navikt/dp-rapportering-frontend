import { ArrowLeftIcon, ArrowRightIcon } from "@navikt/aksel-icons";
import { Alert, Button, Heading } from "@navikt/ds-react";
import { PortableText } from "@portabletext/react";
import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { uuidv7 } from "uuidv7";

import { KanIkkeSendes } from "~/components/kan-ikke-sendes/KanIkkeSendes";
import { NavigasjonContainer } from "~/components/navigasjon-container/NavigasjonContainer";
import navigasjonStyles from "~/components/navigasjon-container/NavigasjonContainer.module.css";
import { ReactLink } from "~/components/ReactLink";
import { useAnalytics } from "~/hooks/useAnalytics";
import { useSanity } from "~/hooks/useSanity";
import { useTypedRouteLoaderData } from "~/hooks/useTypedRouteLoaderData";
import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { skalIkkeHaArbeidssokerSporsmal } from "~/utils/periode.utils";

function nesteSide(periode: IRapporteringsperiode) {
  if (skalIkkeHaArbeidssokerSporsmal(periode)) {
    return `/periode/${periode.id}/send-inn`;
  }

  return `/periode/${periode.id}/arbeidssoker`;
}

export default function TomRapporteringsPeriodeSide() {
  const { periode } = useTypedRouteLoaderData("routes/periode.$rapporteringsperiodeId");
  const { getAppText, getRichText } = useSanity();

  const navigate = useNavigate();
  const { trackSkjemaStegStartet, trackSkjemaStegFullført } = useAnalytics();
  const sesjonId = useMemo(uuidv7, [periode.id]);
  const stegnavn = "tom";
  const steg = 3;

  const neste = () => {
    trackSkjemaStegFullført({
      periode,
      stegnavn,
      steg,
      sesjonId,
    });

    navigate(nesteSide(periode));
  };

  useEffect(() => {
    trackSkjemaStegStartet({
      periode,
      stegnavn,
      steg,
      sesjonId,
    });
  }, []);

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
        <ReactLink
          as="Button"
          to=""
          onClick={() => navigate(-1)}
          variant="secondary"
          iconPosition="left"
          icon={<ArrowLeftIcon aria-hidden />}
          className={navigasjonStyles.knapp}
        >
          {getAppText("rapportering-knapp-tilbake")}
        </ReactLink>

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
