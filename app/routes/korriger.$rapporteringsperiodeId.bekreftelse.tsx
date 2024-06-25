import { Heading } from "@navikt/ds-react";
import { useSanity } from "~/hooks/useSanity";
import { useTypedRouteLoaderData } from "~/hooks/useTypedRouteLoaderData";
import { RemixLink } from "~/components/RemixLink";
import { AktivitetOppsummering } from "~/components/aktivitet-oppsummering/AktivitetOppsummering";
import { Kalender } from "~/components/kalender/Kalender";

export default function KorrigeringBekreftelsesSide() {
  const { periode } = useTypedRouteLoaderData("routes/korriger.$rapporteringsperiodeId");
  const { getAppText } = useSanity();

  return (
    <>
      <div className="rapportering-container">
        <Heading tabIndex={-1} className="vo-fokus" size={"medium"} level={"2"} spacing={true}>
          {getAppText("rapportering-korriger-bekreftelse-tittel")}
        </Heading>
        <div className="graa-bakgrunn">
          <Kalender rapporteringsperiode={periode} aapneModal={() => {}} readonly />
          <div className="registert-meldeperiode-container">
            <AktivitetOppsummering rapporteringsperiode={periode} />
          </div>
        </div>
        <div className="navigasjon-container">
          <RemixLink as="Button" to="/rapportering">
            {getAppText("rapportering-korriger-bekreftelse-tilbake-knapp")}
          </RemixLink>
        </div>
      </div>
    </>
  );
}
