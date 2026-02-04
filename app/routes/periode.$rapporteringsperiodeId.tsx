import { Accordion } from "@navikt/ds-react";
import { useEffect } from "react";
import type { LoaderFunctionArgs } from "react-router";
import { Outlet, redirect, useLoaderData, useLocation, useRouteError } from "react-router";
import invariant from "tiny-invariant";

import { DevelopmentContainer } from "~/components/development-container/DevelopmentContainer";
import { GeneralErrorBoundary } from "~/components/error-boundary/GeneralErrorBoundary";
import { useSanity } from "~/hooks/useSanity";
import { logg } from "~/models/logger.server";
import { hentPeriode } from "~/models/rapporteringsperiode.server";
import { baseUrl, setBreadcrumbs } from "~/utils/dekoratoren.utils";
import { IRapporteringsperiodeStatus } from "~/utils/types";

export async function loader({ request, params }: LoaderFunctionArgs) {
  invariant(params.rapporteringsperiodeId, "rapportering-feilmelding-periode-id-mangler-i-url");

  const periodeId = params.rapporteringsperiodeId;
  const url = new URL(request.url);

  const skalHenteOriginal = ["endre"];
  const hentOriginal = skalHenteOriginal.some((url) => request.url.includes(url));

  const { periode } = await hentPeriode(request, periodeId, hentOriginal, "loader-periode");

  // Guard: Hindre tilgang til utfyllingssider for allerede innsendte/ferdige/feilede perioder
  // Unntatt: bekreftelses-sider, endring-flyt, og start-endring
  const erBekreftelseSide = url.pathname.includes("/bekreftelse");
  const erEndringsflyt = url.pathname.includes("/endring/");
  const erStartEndring = url.pathname.endsWith("/endre");
  const skalIkkeGuarde = erBekreftelseSide || erEndringsflyt || erStartEndring;

  if (!skalIkkeGuarde && periode.status !== IRapporteringsperiodeStatus.TilUtfylling) {
    logg({
      type: "warn",
      message: `Bruker prøvde å fylle ut periode som ikke er TilUtfylling, ID: ${periodeId}`,
      correlationId: null,
      body: { periodeId, status: periode.status, url: url.pathname },
    });

    // Redirect til forsiden
    throw redirect("../");
  }

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
