import { Heading } from "@navikt/ds-react";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Kalender } from "~/components/kalender/Kalender";
import type { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { hentAllePerioder } from "~/models/rapporteringsperiode.server";

export async function loader({ request }: LoaderArgs) {
  console.log("rapportering/alle loader");

  const allePerioderResponse = await hentAllePerioder(request);

  if (!allePerioderResponse.ok) {
    const { status, statusText } = allePerioderResponse;
    throw json({}, { status, statusText });
  }

  const allePerioder = await allePerioderResponse.json();

  return json({ allePerioder });
}

export default function RapporteringAlle() {
  const { allePerioder } = useLoaderData<typeof loader>();
  const perioder = allePerioder as IRapporteringsperiode[];

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
        <p>Her kan du se alle tidligere rapportertinger du har sendt til NAV.</p>
        {perioder.map((periode) => {
          return (
            <div className="graa-bakgrunn" key={periode.id}>
              <Kalender
                rapporteringsperiode={periode as IRapporteringsperiode}
                aapneModal={() => {}}
                visRedigeringsAlternativer={true}
              />
            </div>
          );
        })}
      </main>
    </>
  );
}
