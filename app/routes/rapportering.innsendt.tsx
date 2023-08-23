import { Alert, BodyLong, Heading } from "@navikt/ds-react";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Kalender } from "~/components/kalender/Kalender";
import type { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { hentAllePerioder, hentGjeldendePeriode } from "~/models/rapporteringsperiode.server";

interface IRapporteringAlleLoader {
  innsendtPerioder: IRapporteringsperiode[];
}

export async function loader({ request }: LoaderArgs) {
  let gjeldendePeriode: IRapporteringsperiode | null = null;
  let innsendtPerioder: IRapporteringsperiode[] = [];

  const allePerioderResponse = await hentAllePerioder(request);

  if (!allePerioderResponse.ok) {
    throw new Response("Feil i uthenting av alle rapporteringsperioder", {
      status: 500,
    });
  } else {
    innsendtPerioder = await allePerioderResponse.json();
  }

  const gjeldendePeriodeResponse = await hentGjeldendePeriode(request);

  if (!gjeldendePeriodeResponse.ok) {
    if (gjeldendePeriodeResponse.status !== 404)
      throw new Response("Feil i uthenting av gjeldende periode", {
        status: 500,
      });
  } else {
    gjeldendePeriode = await gjeldendePeriodeResponse.json();
  }

  if (gjeldendePeriode) {
    innsendtPerioder = [...innsendtPerioder].filter((periode) => periode.status !== "TilUtfylling");
  }

  return json({ innsendtPerioder });
}

export default function RapporteringAlle() {
  const { innsendtPerioder } = useLoaderData<typeof loader>() as IRapporteringAlleLoader;

  return (
    <>
      <div className="rapportering-header">
        <div className="rapportering-header-innhold">
          <Heading level="1" size="xlarge">
            Tidligere rapporteringer for dagpenger
          </Heading>
        </div>
      </div>
      <main className="rapportering-kontainer">
        <Heading size={"medium"} level={"2"}>
          Oversikt over tidligere rapporteringer
        </Heading>
        <BodyLong className="tekst-subtil" spacing>
          Her kan du se alle tidligere rapportertinger du har sendt til NAV.
        </BodyLong>
        {innsendtPerioder.length === 0 && (
          <Alert variant="info">Du har ingen tidligere rapportertinger.</Alert>
        )}
        {innsendtPerioder.map((periode) => {
          return (
            <div className="graa-bakgrunn" key={periode.id}>
              <Kalender
                key={periode.id}
                rapporteringsperiode={periode as IRapporteringsperiode}
                aapneModal={() => {}}
                visRedigeringsAlternativer={true}
                readonly
              />
            </div>
          );
        })}
      </main>
    </>
  );
}
