import { useRouteLoaderData } from "@remix-run/react";
import type { loader as RootLoader } from "~/root";
import type { loader as RouteRapportering } from "~/routes/_index";
import type { loader as RouteRapporteringPeriodeRapporteringsId } from "~/routes/periode.$rapporteringsperiodeId";

type Loaders = {
  root: typeof RootLoader;
  "routes/_index": typeof RouteRapportering;
  "routes/periode.$rapporteringsperiodeId": typeof RouteRapporteringPeriodeRapporteringsId;
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
