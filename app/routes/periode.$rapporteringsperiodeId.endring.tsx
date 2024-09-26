import { Outlet } from "@remix-run/react";
import { baseUrl, setBreadcrumbs } from "~/utils/dekoratoren.utils";
import { useSanity } from "~/hooks/useSanity";
import { useTypedRouteLoaderData } from "~/hooks/useTypedRouteLoaderData";

export default function RapporteringsPeriodeSide() {
  const { periode } = useTypedRouteLoaderData("routes/periode.$rapporteringsperiodeId");

  const { getAppText } = useSanity();

  setBreadcrumbs(
    [
      {
        title: "rapportering-brodsmule-innsendte-meldekort",
        url: `${baseUrl}/innsendt`,
      },
      {
        title: "rapportering-brodsmule-endre-meldekort",
        url: `${baseUrl}/periode/endring/${periode.id}`,
        handleInApp: true,
      },
    ],
    getAppText
  );

  return <Outlet />;
}
