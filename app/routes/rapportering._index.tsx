import { BodyLong, Heading } from "@navikt/ds-react";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { RemixLink } from "~/components/RemixLink";
import {
  hentAllePerioder,
  hentGjeldendePeriode,
  type IRapporteringsperiode,
} from "~/models/rapporteringsperiode.server";
import { formaterPeriodeDato, formaterPeriodeTilUkenummer } from "~/utils/dato.utils";

interface IRapporteringIndexLoader {
  gjeldendePeriode: IRapporteringsperiode | null;
  innsendtPerioder: IRapporteringsperiode[];
}

export async function loader({ request }: LoaderArgs) {
  const allePerioderResponse = await hentAllePerioder(request);

  let gjeldendePeriode: IRapporteringsperiode | null = null;
  let innsendtPerioder: IRapporteringsperiode[] = [];

  const gjeldendePeriodeResponse = await hentGjeldendePeriode(request);

  if (!gjeldendePeriodeResponse.ok) {
    if (gjeldendePeriodeResponse.status !== 404)
      throw new Response("Feil i uthenting av gjeldende periode", {
        status: 500,
      });
  } else {
    gjeldendePeriode = await gjeldendePeriodeResponse.json();
  }

  if (!allePerioderResponse.ok) {
    throw new Response("Feil i uthenting av alle rapporteringsperioder", {
      status: 500,
    });
  } else {
    const allePerioder: IRapporteringsperiode[] = await allePerioderResponse.json();

    if (gjeldendePeriode) {
      innsendtPerioder = allePerioder.filter((a) => a.id !== gjeldendePeriode?.id);
    }

    return json({ gjeldendePeriode, innsendtPerioder });
  }
}

export default function RapporteringsLandingside() {
  const { gjeldendePeriode, innsendtPerioder } = useLoaderData<
    typeof loader
  >() as IRapporteringIndexLoader;

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
              <RemixLink as="Button" to={`/rapportering/periode/${gjeldendePeriode.id}/fyllut`}>
                Rapporter for perioden
              </RemixLink>
            </div>
          </>
        )}
        {innsendtPerioder.length > 0 && (
          <p>
            <RemixLink as="Link" to="/rapportering/alle">
              Se og korriger tidligere rapporteringer
            </RemixLink>
          </p>
        )}
      </main>
    </>
  );
}
