import { useRouteLoaderData } from "@remix-run/react";
import type { SerializeFrom } from "@remix-run/node";
import type { loader as RootLoader } from "~/root";
import type { loader as RouteRapportering } from "~/routes/rapportering";
import type { loader as RouteRapporteringPeriodeRapporteringsId } from "~/routes/rapportering.periode.$rapporteringsperiodeId";
import type { loader as RouteRapporteringKorringeringRapporteringsId } from "~/routes/rapportering.korriger.$rapporteringsperiodeId";

type Loaders = {
  root: typeof RootLoader;
  "routes/rapportering": typeof RouteRapportering;
  "routes/rapportering.periode.$rapporteringsperiodeId": typeof RouteRapporteringPeriodeRapporteringsId;
  "routes/rapportering.korriger.$rapporteringsperiodeId": typeof RouteRapporteringKorringeringRapporteringsId;
};

export function useTypedRouteLoaderData<T extends keyof Loaders>(route: T) {
  return useRouteLoaderData(route) as SerializeFrom<Loaders[T]>;
}
