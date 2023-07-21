import type { LoaderArgs } from "@remix-run/node";
import {
  IRapporteringsperiode,
  lagKorrigeringsperiode,
} from "~/models/rapporteringsperiode.server";
import { redirect } from "@remix-run/node";

export async function loader({ request, params }: LoaderArgs) {
  console.log("rapportering/periode/$Id/korrigering loader");
  let periodeId = params.rapporteringsperiodeId || "";

  const response = await lagKorrigeringsperiode(periodeId, request);

  if (response.ok) {
    const korrigeringsperiode: IRapporteringsperiode = await response.json();
    console.log(korrigeringsperiode);
    return redirect(`/rapportering/periode/${korrigeringsperiode.id}`);
  } else {
    throw new Error("Klarte ikke starte korrigering");
  }
}
