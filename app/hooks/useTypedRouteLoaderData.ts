import { useRouteLoaderData } from "@remix-run/react";
import type { loader as RootLoader } from "~/root";
import type { loader as RouteRapportering } from "~/routes/rapportering";
import type { loader as RouteRapporteringKorringeringRapporteringsId } from "~/routes/rapportering.korriger.$rapporteringsperiodeId";
import type { loader as RouteRapporteringPeriodeRapporteringsId } from "~/routes/rapportering.periode.$rapporteringsperiodeId";

type Loaders = {
  root: typeof RootLoader;
  "routes/rapportering": typeof RouteRapportering;
  "routes/rapportering.periode.$rapporteringsperiodeId": typeof RouteRapporteringPeriodeRapporteringsId;
  "routes/rapportering.korriger.$rapporteringsperiodeId": typeof RouteRapporteringKorringeringRapporteringsId;
};

export function useTypedRouteLoaderData<T extends keyof Loaders>(route: T) {
  const routeData = useRouteLoaderData<Loaders[T]>(route);

  if (!routeData) {
    throw new Error(
      "Route data is not loaded. You might be trying to accessing data from a sub route that has not yet loaded"
    );
  }

  return routeData;
}
