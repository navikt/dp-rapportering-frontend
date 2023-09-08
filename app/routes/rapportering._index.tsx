import { BodyLong, BodyShort, Heading } from "@navikt/ds-react";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { RemixLink } from "~/components/RemixLink";
import { useSetFokus } from "~/hooks/useSetFokus";
import { useScrollToView } from "~/hooks/useSkrollTilSeksjon";
import {
  hentGjeldendePeriode,
  type IRapporteringsperiode,
} from "~/models/rapporteringsperiode.server";
import { lagBrodsmulesti } from "~/utils/brodsmuler.utils";
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
  lagBrodsmulesti();

  const sidelastFokusRef = useRef(null);
  const { setFokus } = useSetFokus();
  const { scrollToView } = useScrollToView();

  useEffect(() => {
    scrollToView(sidelastFokusRef);
    setFokus(sidelastFokusRef);
  }, [setFokus, scrollToView]);

  let invaerendePeriodeTekst;

  if (gjeldendePeriode) {
    const ukenummer = formaterPeriodeTilUkenummer(
      gjeldendePeriode.fraOgMed,
      gjeldendePeriode.tilOgMed
    );
    const dato = formaterPeriodeDato(gjeldendePeriode.fraOgMed, gjeldendePeriode.tilOgMed);

    invaerendePeriodeTekst = `Uke ${ukenummer} (${dato})`;
  }

  return (
    <>
      <div className="rapportering-header">
        <div className="rapportering-header-innhold">
          <Heading
            ref={sidelastFokusRef}
            tabIndex={-1}
            level="1"
            size="xlarge"
            className="vo-fokus"
          >
            Dine dagpenger
          </Heading>
        </div>
      </div>
      <main className="rapportering-kontainer">
        <BodyLong spacing>
          For å motta dagpenger må du rapportere hver 14. dag. Du må rapportere hvor mye du har
          jobbet, og om du har vært syk, hatt fravær eller vært på ferie. NAV bruker informasjonen
          du gir til å beregne hvor mye du får i dagpenger.
        </BodyLong>
        <BodyLong spacing>Du må også rapportere mens du venter på svar på søknaden din.</BodyLong>

        <Heading size={"small"} level="2">
          Inneværende dagpengerapportering
        </Heading>
        {!gjeldendePeriode && <>Du har ingen perioder å rapportere</>}
        {gjeldendePeriode && (
          <div>
            <BodyShort>{invaerendePeriodeTekst}</BodyShort>
            <RemixLink
              as="Button"
              to={`/rapportering/periode/${gjeldendePeriode.id}/fyll-ut`}
              className="my-4"
            >
              Rapporter for perioden
            </RemixLink>
          </div>
        )}
        <p>
          <RemixLink as="Link" to="/rapportering/innsendt">
            Se og korriger innsendte rapporteringer
          </RemixLink>
        </p>
      </main>
    </>
  );
}
