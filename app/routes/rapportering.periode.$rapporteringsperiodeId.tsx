import { Accordion } from "@navikt/ds-react";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { DevelopmentKontainer } from "~/components/development-kontainer/DevelopmentKontainer";
import type { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { hentPeriode } from "~/models/rapporteringsperiode.server";
import { hentBrodsmuleUrl, lagBrodsmulesti } from "~/utils/brodsmuler.utils";

export interface IRapporteringsPeriodeLoader {
  periode: IRapporteringsperiode;
}

export async function loader({ request, params }: LoaderArgs) {
  const periodeId = params.rapporteringsperiodeId || "";
  const periodeResponse = await hentPeriode(request, periodeId);

  if (periodeResponse.ok) {
    const periode = await periodeResponse.json();
    return json({ periode });
  } else {
    throw new Response(`Feil i uthenting av rapporteringsperiode`, { status: 500 });
  }
}

export default function Rapportering() {
  const { periode } = useLoaderData<typeof loader>() as IRapporteringsPeriodeLoader;

  lagBrodsmulesti([
    {
      title: "Fyll ut rapportering",
      url: hentBrodsmuleUrl(`/periode/${periode.id}`),
    },
  ]);

  return (
    <>
      <Outlet />
      <div className="debug-kontainer">
        <DevelopmentKontainer>
          <Accordion>
            <Accordion.Item>
              <Accordion.Header>(DEBUG) Rapporteringsperiode som json:</Accordion.Header>
              <Accordion.Content>
                <pre>${JSON.stringify(periode, null, 2)}</pre>
              </Accordion.Content>
            </Accordion.Item>
          </Accordion>
        </DevelopmentKontainer>
      </div>
    </>
  );
}
