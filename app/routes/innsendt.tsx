import { Alert, BodyLong, Heading } from "@navikt/ds-react";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  type IRapporteringsperiode,
  hentInnsendtePerioder,
} from "~/models/rapporteringsperiode.server";
import { useSanity } from "~/hooks/useSanity";
import { RemixLink } from "~/components/RemixLink";
import { AktivitetOppsummering } from "~/components/aktivitet-oppsummering/AktivitetOppsummering";
import { Kalender } from "~/components/kalender/Kalender";

export async function loader({ request }: LoaderFunctionArgs) {
  let innsendtPerioder: IRapporteringsperiode[] = [];

  const allePerioderResponse = await hentInnsendtePerioder(request);

  if (!allePerioderResponse.ok) {
    throw new Response("Feil i uthenting av alle rapporteringsperioder", {
      status: 500,
    });
  } else {
    if (allePerioderResponse.status === 204) {
      innsendtPerioder = [];
    } else {
      innsendtPerioder = await allePerioderResponse.json();
    }
  }

  return json({ innsendtPerioder });
}

export default function InnsendteRapporteringsPerioderSide() {
  const { innsendtPerioder } = useLoaderData<typeof loader>();

  // TODO: "Implementer brødsmulesti /innsendt"

  const { getAppText } = useSanity();

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
          <div key={periode.id}>
            <div className="graa-bakgrunn">
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
            </div>
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
