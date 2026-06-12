import { useEffect, useRef } from "react";
import { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";

import { Kvittering } from "~/components/Kvittering";
import { useAnalytics } from "~/hooks/useAnalytics";
import { useSanity } from "~/hooks/useSanity";
import { useTypedRouteLoaderData } from "~/hooks/useTypedRouteLoaderData";
import { hentErRegistrertArbeidssoker } from "~/models/arbeidssoker.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const erRegistrertArbeidssoker = await hentErRegistrertArbeidssoker(request);

  return { erRegistrertArbeidssoker };
}

export default function RapporteringsPeriodesBekreftelsesSide() {
  const { erRegistrertArbeidssoker } = useLoaderData<typeof loader>();
  const { periode } = useTypedRouteLoaderData("routes/periode.$rapporteringsperiodeId");
  const { getAppText } = useSanity();

  const { trackSkjemaFullført } = useAnalytics();
  const tracked = useRef(false);

  useEffect(() => {
    if (!tracked.current) {
      trackSkjemaFullført(periode.id, periode.rapporteringstype, true);
      tracked.current = true;
    }
  }, [periode.id, trackSkjemaFullført, periode.rapporteringstype]);

  return (
    <Kvittering
      tittel={getAppText("rapportering-periode-endring-bekreftelse-tittel")}
      periode={periode}
      harNestePeriode={false}
      erRegistrertArbeidssoker={erRegistrertArbeidssoker}
    />
  );
}
