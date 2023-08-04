import type { LoaderArgs } from "@remix-run/node";
import type { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { lagKorrigeringsperiode } from "~/models/rapporteringsperiode.server";
import { redirect } from "@remix-run/node";
import invariant from "tiny-invariant";

export async function loader({ request, params }: LoaderArgs) {
  console.log("rapportering/periode/$Id/korriger loader");
  invariant(params.rapporteringsperiodeId, `params.rapporteringsperiode er påkrevd`);

  const periodeId = params.rapporteringsperiodeId;
  const response = await lagKorrigeringsperiode(periodeId, request);

  if (response.ok) {
    const korrigeringsperiode: IRapporteringsperiode = await response.json();
    return redirect(`/rapportering/korriger/${korrigeringsperiode.id}/fyllut`);
  } else {
    throw new Response(`Klarte ikke avgodkjenne periode med id: ${periodeId}`, { status: 500 });
  }
}