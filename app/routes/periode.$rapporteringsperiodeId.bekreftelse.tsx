import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect, useRef } from "react";

import { Kvittering } from "~/components/Kvittering";
import { useAnalytics } from "~/hooks/useAnalytics";
import { useSanity } from "~/hooks/useSanity";
import { useTypedRouteLoaderData } from "~/hooks/useTypedRouteLoaderData";
import { hentRapporteringsperioder } from "~/models/rapporteringsperiode.server";
import { perioderSomKanSendes } from "~/utils/periode.utils";

export async function loader({ request }: LoaderFunctionArgs) {
  // TODO: Er listen med rapporteringsperioder med eller uten den innsendte perioden?
  const rapporteringsperioder = await hentRapporteringsperioder(request);
  const harNestePeriode = perioderSomKanSendes(rapporteringsperioder).length > 0;

  return { harNestePeriode };
}

export default function RapporteringsPeriodesBekreftelsesSide() {
  const { harNestePeriode } = useLoaderData<typeof loader>();
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
    />
  );
}
