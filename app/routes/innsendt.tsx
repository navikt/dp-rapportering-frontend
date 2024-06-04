import { Alert, BodyLong, Heading } from "@navikt/ds-react";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { DevTools } from "~/devTools";
import {
  type IRapporteringsperiode,
  hentInnsendtePerioder,
} from "~/models/rapporteringsperiode.server";
import { isLocalOrDemo } from "~/utils/env.utils";
import { useSanity } from "~/hooks/useSanity";
import { useSetFokus } from "~/hooks/useSetFokus";
import { useScrollToView } from "~/hooks/useSkrollTilSeksjon";
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
    innsendtPerioder = await allePerioderResponse.json();
  }

  return json({ innsendtPerioder });
}

export default function InnsendteRapporteringsPerioderSide() {
  const { innsendtPerioder } = useLoaderData<typeof loader>();

  // TODO: "Implementer brødsmulesti /innsendt"

  const sidelastFokusRef = useRef(null);
  const { setFokus } = useSetFokus();
  const { scrollToView } = useScrollToView();
  const { getAppText } = useSanity();

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
            {getAppText("rapportering-innsendt-tittel")}
          </Heading>
          {isLocalOrDemo && <DevTools />}
        </div>
      </div>
      <div className="rapportering-container">
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
                  aapneModal={() => {}}
                  visRedigeringsAlternativer={true}
                  readonly
                />
                {flatMapAktiviteter.length < 1 && (
                  <p>{getAppText("rapportering-innsendt-ikke-fravaer")}</p>
                )}
              </div>
              <AktivitetOppsummering rapporteringsperiode={periode} />
              <br />
              <hr aria-hidden />
            </div>
          );
        })}
      </div>
    </>
  );
}
