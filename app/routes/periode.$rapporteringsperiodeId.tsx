import { Accordion } from "@navikt/ds-react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData, useLocation, useRouteError } from "@remix-run/react";
import { useEffect } from "react";
import invariant from "tiny-invariant";
import { hentPeriode } from "~/models/rapporteringsperiode.server";
import { baseUrl, setBreadcrumbs } from "~/utils/dekoratoren.utils";
import { useSanity } from "~/hooks/useSanity";
import { DevelopmentContainer } from "~/components/development-container/DevelopmentContainer";
import { GeneralErrorBoundary } from "~/components/error-boundary/GeneralErrorBoundary";

export async function loader({ request, params }: LoaderFunctionArgs) {
  invariant(params.rapporteringsperiodeId, "rapportering-feilmelding-periode-id-mangler-i-url");

  const periodeId = params.rapporteringsperiodeId;

  const skalHenteOriginal = ["endre"];
  const hentOriginal = skalHenteOriginal.some((url) => request.url.includes(url));

  const { periode } = await hentPeriode(request, periodeId, false);

  return json({ periode });
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
      getAppText
    );
  }, [getAppText, pathname]);

  return (
    <>
      <Outlet />
      <div className="debug-container">
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
      </div>
    </>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  return <GeneralErrorBoundary error={error} />;
}
