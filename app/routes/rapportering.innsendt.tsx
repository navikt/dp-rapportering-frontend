import { Alert, BodyLong, Heading } from "@navikt/ds-react";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { Kalender } from "~/components/kalender/Kalender";
import { useSetFokus } from "~/hooks/useSetFokus";
import { useScrollToView } from "~/hooks/useSkrollTilSeksjon";
import type { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { hentAllePerioder, hentGjeldendePeriode } from "~/models/rapporteringsperiode.server";
import { getOboToken } from "~/utils/auth.utils.server";
import { hentBrodsmuleUrl, lagBrodsmulesti } from "~/utils/brodsmuler.utils";

interface IRapporteringAlleLoader {
  innsendtPerioder: IRapporteringsperiode[];
}

export async function loader({ request }: LoaderArgs) {
  let innsendtPerioder: IRapporteringsperiode[] = [];

  const onBehalfOfToken = await getOboToken(request);
  const allePerioder = await hentAllePerioder(onBehalfOfToken);
  const gjeldendePeriode = await hentGjeldendePeriode(onBehalfOfToken);

  if (gjeldendePeriode) {
    innsendtPerioder = allePerioder.filter((periode) => periode.id !== gjeldendePeriode?.id);
  }

  return json({ innsendtPerioder });
}

export default function RapporteringAlle() {
  const { innsendtPerioder } = useLoaderData<typeof loader>() as IRapporteringAlleLoader;

  lagBrodsmulesti([
    { title: "Innsendte rapporteringsperioder", url: hentBrodsmuleUrl("/innsendt") },
  ]);

  const sidelastFokusRef = useRef(null);
  const { setFokus } = useSetFokus();
  const { scrollToView } = useScrollToView();

  useEffect(() => {
    scrollToView(sidelastFokusRef);
    setFokus(sidelastFokusRef);
  }, [setFokus, scrollToView]);

  return (
    <>
      <div className="rapportering-header">
        <div className="rapportering-header-innhold">
          <Heading
            ref={sidelastFokusRef}
            tabIndex={-1}
            className="vo-fokus"
            level="1"
            size="xlarge"
          >
            Innsendte rapporteringer for dagpenger
          </Heading>
        </div>
      </div>
      <div className="rapportering-kontainer">
        <Heading size={"medium"} level={"2"}>
          Oversikt over innsendte rapporteringer
        </Heading>
        <BodyLong className="tekst-subtil" spacing>
          Her kan du se alle innsendte rapportertinger du har sendt til NAV.
        </BodyLong>
        {innsendtPerioder.length === 0 && (
          <Alert variant="info">Du har ingen innsendte rapportertinger.</Alert>
        )}
        {innsendtPerioder.map((periode) => {
          const flatMapAktiviteter = periode.dager.flatMap((d) => d.aktiviteter);
          return (
            <div className="graa-bakgrunn" key={periode.id}>
              <Kalender
                key={periode.id}
                rapporteringsperiode={periode}
                aapneModal={() => {}}
                visRedigeringsAlternativer={true}
                readonly
              />
              {flatMapAktiviteter.length < 1 && (
                <p>Du har ikke jobbet, vært syk eller hatt fravær i denne perioden.</p>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
