import { Alert, BodyLong, Heading } from "@navikt/ds-react";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import { hentInnsendtePerioder } from "~/models/rapporteringsperiode.server";
import { baseUrl, setBreadcrumbs } from "~/utils/dekoratoren.utils";
import { useSanity } from "~/hooks/useSanity";
import { RemixLink } from "~/components/RemixLink";
import { AktivitetOppsummering } from "~/components/aktivitet-oppsummering/AktivitetOppsummering";
import { Kalender } from "~/components/kalender/Kalender";

export async function loader({ request }: LoaderFunctionArgs) {
  const innsendtPerioder = await hentInnsendtePerioder(request);

  return json({ innsendtPerioder });
}

export default function InnsendteRapporteringsPerioderSide() {
  const { innsendtPerioder } = useLoaderData<typeof loader>();

  const { getAppText } = useSanity();

  useEffect(() => {
    setBreadcrumbs(
      [
        {
          title: "rapportering-brodsmule-innsendte-meldekort",
          url: `${baseUrl}/periode/innsendt`,
          handleInApp: true,
        },
      ],
      getAppText
    );
  }, [getAppText]);

  return (
    <>
      <Heading size={"medium"} level={"2"}>
        {getAppText("rapportering-innsendt-beskrivelse-tittel")}
      </Heading>
      <BodyLong className="tekst-subtil" spacing>
        {getAppText("rapportering-innsendt-beskrivelse-innhold")}
      </BodyLong>
      {innsendtPerioder.length === 0 && (
        <Alert variant="info">{getAppText("rapportering-innsendt-ingen-innsendte")}</Alert>
      )}
      {innsendtPerioder.map((periode) => {
        const flatMapAktiviteter = periode.dager.flatMap((d) => d.aktiviteter);
        return (
          <div className="oppsummering" key={periode.id}>
            <Kalender
              key={periode.id}
              rapporteringsperiode={periode}
              visEndringslenke={periode.kanEndres}
              aapneModal={() => {}}
              readonly
            />
            {flatMapAktiviteter.length < 1 && (
              <p>{getAppText("rapportering-innsendt-ikke-fravaer")}</p>
            )}
            <AktivitetOppsummering rapporteringsperiode={periode} />
          </div>
        );
      })}

      <div className="navigasjon-container">
        <RemixLink as="Button" to="/" className="py-4 px-8">
          {getAppText("rapportering-knapp-tilbake-til-start")}
        </RemixLink>
      </div>
    </>
  );
}
