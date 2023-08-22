import { BodyLong, Heading } from "@navikt/ds-react";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { RemixLink } from "~/components/RemixLink";
import {
  hentGjeldendePeriode,
  type IRapporteringsperiode,
} from "~/models/rapporteringsperiode.server";
import { formaterPeriodeDato, formaterPeriodeTilUkenummer } from "~/utils/dato.utils";

interface IRapporteringIndexLoader {
  gjeldendePeriode: IRapporteringsperiode | null;
}

export async function loader({ request }: LoaderArgs) {
  let gjeldendePeriode: IRapporteringsperiode | null = null;

  const gjeldendePeriodeResponse = await hentGjeldendePeriode(request);

  if (!gjeldendePeriodeResponse.ok) {
    if (gjeldendePeriodeResponse.status !== 404)
      throw new Response("Feil i uthenting av gjeldende periode", {
        status: 500,
      });
  } else {
    gjeldendePeriode = await gjeldendePeriodeResponse.json();
  }

  return json({ gjeldendePeriode });
}

export default function RapporteringsLandingside() {
  const { gjeldendePeriode } = useLoaderData<typeof loader>() as IRapporteringIndexLoader;

  return (
    <>
      <div className="rapportering-header">
        <div className="rapportering-header-innhold">
          <Heading level="1" size="xlarge">
            Dine dagpenger
          </Heading>
        </div>
      </div>
      <main className="rapportering-kontainer">
        <BodyLong spacing>
          For å motta dagpenger må du rapportere hvor mye du har jobbet, og om du har vært syk eller
          på ferie hver 14. dag. NAV bruker dette for å beregne hvor mye du skal ha i dagpenger.
        </BodyLong>
        <BodyLong spacing>Du må også rapportere mens du venter på svar på søknaden din.</BodyLong>
        <Heading size={"small"} level="2">
          Inneværende dagpengerapportering
        </Heading>
        {!gjeldendePeriode && <>Du har ingen perioder å rapportere</>}
        {gjeldendePeriode && (
          <>
            <span>
              Uke{" "}
              {formaterPeriodeTilUkenummer(gjeldendePeriode.fraOgMed, gjeldendePeriode.tilOgMed)} (
              {formaterPeriodeDato(gjeldendePeriode.fraOgMed, gjeldendePeriode.tilOgMed)})
            </span>
            <br />
            <br />
            <div>
              <RemixLink as="Button" to={`/rapportering/periode/${gjeldendePeriode.id}/fyll-ut`}>
                Rapporter for perioden
              </RemixLink>
            </div>
          </>
        )}
        <p>
          <RemixLink as="Link" to="/rapportering/innsendt">
            Se og korriger tidligere rapporteringer
          </RemixLink>
        </p>
      </main>
    </>
  );
}
