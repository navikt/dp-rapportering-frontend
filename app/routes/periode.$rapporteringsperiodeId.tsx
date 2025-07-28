import { Accordion } from "@navikt/ds-react";
import { useEffect } from "react";
import type { LoaderFunctionArgs } from "react-router";
import { Outlet, useLoaderData, useLocation, useRouteError } from "react-router";
import invariant from "tiny-invariant";

import { DevelopmentContainer } from "~/components/development-container/DevelopmentContainer";
import { GeneralErrorBoundary } from "~/components/error-boundary/GeneralErrorBoundary";
import { useSanity } from "~/hooks/useSanity";
import { hentPeriode } from "~/models/rapporteringsperiode.server";
import { baseUrl, setBreadcrumbs } from "~/utils/dekoratoren.utils";

export async function loader({ request, params }: LoaderFunctionArgs) {
  invariant(params.rapporteringsperiodeId, "rapportering-feilmelding-periode-id-mangler-i-url");

  const periodeId = params.rapporteringsperiodeId;

  const skalHenteOriginal = ["endre"];
  const hentOriginal = skalHenteOriginal.some((url) => request.url.includes(url));

  const { periode } = await hentPeriode(request, periodeId, hentOriginal, "loader-periode");

  return { periode };
}

export default function RapporteringsPeriodeSide() {
  const { periode } = useLoaderData<typeof loader>();
  const { pathname } = useLocation();

  const { getAppText } = useSanity();

  useEffect(() => {
    setBreadcrumbs(
      [
        {
          title: "rapportering-brodsmule-fyll-ut-meldekort",
          url: `${baseUrl}${pathname}`,
        },
      ],
      getAppText,
    );
  }, [getAppText, pathname]);

  return (
    <>
      <Outlet />
      <DevelopmentContainer>
        <Accordion>
          <Accordion.Item>
            <Accordion.Header>(DEBUG) Rapporteringsperiode som json:</Accordion.Header>
            <Accordion.Content>
              <pre>${JSON.stringify(periode, null, 2)}</pre>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion>
      </DevelopmentContainer>
    </>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  return <GeneralErrorBoundary error={error} />;
}
