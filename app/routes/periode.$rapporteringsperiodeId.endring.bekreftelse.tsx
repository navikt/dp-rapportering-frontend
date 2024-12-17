import { useEffect, useRef } from "react";

import { Kvittering } from "~/components/Kvittering";
import { useAnalytics } from "~/hooks/useAnalytics";
import { useSanity } from "~/hooks/useSanity";
import { useTypedRouteLoaderData } from "~/hooks/useTypedRouteLoaderData";

export default function RapporteringsPeriodesBekreftelsesSide() {
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
    />
  );
}
