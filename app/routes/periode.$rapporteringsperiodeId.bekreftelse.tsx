import { useEffect, useRef } from "react";
import { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";

import { Kvittering } from "~/components/Kvittering";
import { useAnalytics } from "~/hooks/useAnalytics";
import { useSanity } from "~/hooks/useSanity";
import { useTypedRouteLoaderData } from "~/hooks/useTypedRouteLoaderData";
import { hentErRegistrertArbeidssoker } from "~/models/arbeidssoker.server";
import { hentRapporteringsperioder } from "~/models/rapporteringsperiode.server";
import { perioderSomKanSendes } from "~/utils/periode.utils";

export async function loader({ request }: LoaderFunctionArgs) {
  const rapporteringsperioder = await hentRapporteringsperioder(request);
  const harNestePeriode = perioderSomKanSendes(rapporteringsperioder).length > 0;
  const erRegistrertArbeidssoker = await hentErRegistrertArbeidssoker(request);

  return { harNestePeriode, erRegistrertArbeidssoker };
}

export default function RapporteringsPeriodesBekreftelsesSide() {
  const { harNestePeriode, erRegistrertArbeidssoker } = useLoaderData<typeof loader>();
  const { periode } = useTypedRouteLoaderData("routes/periode.$rapporteringsperiodeId");
  const { getAppText } = useSanity();

  const { trackSkjemaFullført } = useAnalytics();
  const tracked = useRef(false);

  useEffect(() => {
    if (!tracked.current) {
      trackSkjemaFullført(periode.id, periode.rapporteringstype);
      tracked.current = true;
    }
  }, [periode.id, trackSkjemaFullført, periode.rapporteringstype]);

  return (
    <Kvittering
      tittel={getAppText("rapportering-periode-bekreftelse-tittel")}
      periode={periode}
      harNestePeriode={harNestePeriode}
      erRegistrertArbeidssoker={erRegistrertArbeidssoker}
    />
  );
}
