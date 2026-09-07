import { useRouteLoaderData } from "react-router";

import type { loader as RootLoader } from "~/root";
import type { loader as RouteRapportering } from "~/routes/_index";
import type { loader as RouteRapporteringPeriodeRapporteringsId } from "~/routes/periode.$rapporteringsperiodeId";

type Loaders = {
  root: typeof RootLoader;
  "routes/_index": typeof RouteRapportering;
  "routes/periode.$rapporteringsperiodeId": typeof RouteRapporteringPeriodeRapporteringsId;
};

export class MissingRouteLoaderDataError extends Error {
  constructor(public readonly routeId: keyof Loaders) {
    super("rapportering-feilmelding-rutedata-mangler");
    this.name = "MissingRouteLoaderDataError";
  }
}

export function useTypedRouteLoaderData<T extends keyof Loaders>(route: T) {
  const routeData = useRouteLoaderData<Loaders[T]>(route);

  if (!routeData) {
    throw new MissingRouteLoaderDataError(route);
  }

  return routeData;
}
