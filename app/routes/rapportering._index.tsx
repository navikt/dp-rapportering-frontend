import { BodyLong, Heading } from "@navikt/ds-react";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { format } from "date-fns";
import nbLocale from "date-fns/locale/nb";
import { RemixLink } from "~/components/RemixLink";
import { hentGjeldendePeriode } from "~/models/rapporteringsperiode.server";
import { formaterPeriodeDato, formaterPeriodeTilUkenummer } from "~/utils/dato.utils";

export async function loader({ request }: LoaderArgs) {
  const gjeldendePeriodeResponse = await hentGjeldendePeriode(request);

  if (gjeldendePeriodeResponse.ok) {
    const periode = await gjeldendePeriodeResponse.json();
    return json(periode);
  } else {
    return json({ ingenperiode: true });
  }
}

export default function RapporteringsLandingside() {
  const data = useLoaderData<typeof loader>();
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
        {data.ingenperiode && <>Du har ingen perioder å rapportere</>}
        {!data.ingenperiode && data.id && (
          <>
            <span>
              Uke {formaterPeriodeTilUkenummer(data.fraOgMed, data.tilOgMed)} (
              {formaterPeriodeDato(data.fraOgMed, data.tilOgMed)})
            </span>
            <br />
            <br />
            <div>
              <RemixLink as={"Button"} to={`/rapportering/periode/${data.id}/fyllut`}>
                Rapporter for perioden
              </RemixLink>
              <p>
                Frist for rapportering:{" "}
                {format(new Date(data.beregnesEtter), "EEEE d. MMMM", { locale: nbLocale })}
              </p>
            </div>
          </>
        )}
        {/* Her bør vi sjekke om bruker har tidligere rapportert rapporteringsperioder */}
        <p>
          <RemixLink as={"Link"} to={"/rapportering/alle"}>
            Se og korriger tidligere rapporteringer
          </RemixLink>
        </p>
      </main>
    </>
  );
}
