import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import type { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { hentPeriode } from "~/models/rapporteringsperiode.server";
import { Outlet } from "@remix-run/react";

export interface IRapporteringsPeriodeLoader {
  periode: IRapporteringsperiode;
}
export async function loader({ request, params }: LoaderArgs) {
  console.log("rapportering/periode/$Id loader");
  let periodeId = params.rapporteringsperiodeId || "";
  let periode = null;

  const periodeResponse = await hentPeriode(request, periodeId);
  if (periodeResponse.ok) {
    periode = await periodeResponse.json();
    return json({ periode });
  } else {
    const { status, statusText } = periodeResponse;
    console.log("uthenting av periode feilet", periodeResponse);
    throw new Response("IIIH NOE GIKK GALT VED UTHENTING AV PERIODE", { status, statusText });
  }
}
export default function Rapportering() {
  return <Outlet />;
}
