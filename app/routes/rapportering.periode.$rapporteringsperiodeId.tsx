import { Accordion } from "@navikt/ds-react";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { DevelopmentKontainer } from "~/components/development-kontainer/DevelopmentKontainer";
import type { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { hentPeriode } from "~/models/rapporteringsperiode.server";
import { getOboToken } from "~/utils/auth.utils.server";
import { hentBrodsmuleUrl, lagBrodsmulesti } from "~/utils/brodsmuler.utils";

export interface IRapporteringsPeriodeLoader {
  periode: IRapporteringsperiode;
}

export async function loader({ request, params }: LoaderArgs) {
  invariant(params.rapporteringsperiodeId, "params.rapporteringsperiode er påkrevd");

  const onBehalfOfToken = await getOboToken(request);
  const periodeId = params.rapporteringsperiodeId;
  const periode = await hentPeriode(onBehalfOfToken, periodeId);

  return json({ periode });
}

export default function Rapportering() {
  const { periode } = useLoaderData<typeof loader>() as IRapporteringsPeriodeLoader;

  lagBrodsmulesti([
    {
      title: "Fyll ut rapporteringen",
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
