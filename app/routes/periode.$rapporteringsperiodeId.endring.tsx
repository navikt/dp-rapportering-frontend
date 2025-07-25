import { Outlet } from "react-router";

import { useSanity } from "~/hooks/useSanity";
import { useTypedRouteLoaderData } from "~/hooks/useTypedRouteLoaderData";
import { baseUrl, setBreadcrumbs } from "~/utils/dekoratoren.utils";

export default function RapporteringsPeriodeSide() {
  const { periode } = useTypedRouteLoaderData("routes/periode.$rapporteringsperiodeId");

  const { getAppText } = useSanity();

  setBreadcrumbs(
    [
      {
        title: "rapportering-brodsmule-endre-meldekort",
        url: `${baseUrl}/periode/endring/${periode.id}`,
        handleInApp: true,
      },
    ],
    getAppText,
  );

  return <Outlet />;
}
