import type { LoaderArgs } from "@remix-run/node";
import { avGodkjennPeriode } from "~/models/rapporteringsperiode.server";
import { redirect } from "@remix-run/node";
import invariant from "tiny-invariant";

export async function loader({ request, params }: LoaderArgs) {
  console.log("rapportering/periode/$Id/avgodkjenn loader");
  invariant(params.rapporteringsperiodeId, `params.rapporteringsperiode er påkrevd`);

  const periodeId = params.rapporteringsperiodeId;
  const response = await avGodkjennPeriode(periodeId, request);

  if (response.ok) {
    return redirect(`/rapportering/periode/${periodeId}/fyllut`);
  } else {
    console.log(response);
    throw new Error(`Klarte ikke avgodkjenne periode med id: ${periodeId}`);
  }
}
