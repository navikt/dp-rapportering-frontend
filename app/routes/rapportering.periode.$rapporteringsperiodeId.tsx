import { Accordion } from "@navikt/ds-react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { DevelopmentContainer } from "~/components/development-container/DevelopmentContainer";
import type { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { hentPeriode } from "~/models/rapporteringsperiode.server";
import { getRapporteringOboToken } from "~/utils/auth.utils.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  invariant(params.rapporteringsperiodeId, "params.rapporteringsperiode er påkrevd");

  const periodeId = params.rapporteringsperiodeId;
  const onBehalfOfToken = await getRapporteringOboToken(request);
  const response = await hentPeriode(onBehalfOfToken, periodeId);

  if (!response.ok) {
    throw new Response("Feil i uthenting av rapporteringsperiode", { status: 500 });
  }

  const periode: IRapporteringsperiode = await response.json();
  return json({ periode });
}

export default function RapporteringsPeriodeSide() {
  const { periode } = useLoaderData<typeof loader>();

  // TODO: Lag brødsmulesti for /periode/${periode.id}

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
