import { Accordion } from "@navikt/ds-react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { DevelopmentContainer } from "~/components/development-container/DevelopmentContainer";
import { hentPeriode } from "~/models/rapporteringsperiode.server";
import { getRapporteringOboToken } from "~/utils/auth.utils.server";
import { hentBrodsmuleUrl, lagBrodsmulesti } from "~/utils/brodsmuler.utils";

export async function loader({ request, params }: LoaderFunctionArgs) {
  invariant(params.rapporteringsperiodeId, "params.rapporteringsperiode er påkrevd");

  const periodeId = params.rapporteringsperiodeId;
  const onBehalfOfToken = await getRapporteringOboToken(request);
  const periodeResponse = await hentPeriode(onBehalfOfToken, periodeId);

  if (periodeResponse.ok) {
    const periode = await periodeResponse.json();
    return json({ periode });
  } else {
    const { status, statusText } = periodeResponse;
    throw new Response("Noe gikk galt ved uthenting av periode", { status, statusText });
  }
}

export default function Rapportering() {
  const { periode } = useLoaderData<typeof loader>();

  lagBrodsmulesti([
    {
      title: "Korriger rapportering",
      url: hentBrodsmuleUrl(`/korriger/${periode.id}`),
    },
  ]);

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
