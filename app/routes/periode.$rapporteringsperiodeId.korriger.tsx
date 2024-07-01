import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import type { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { lagKorrigeringsperiode } from "~/models/rapporteringsperiode.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  invariant(params.rapporteringsperiodeId, "params.rapporteringsperiode er påkrevd");

  const periodeId = params.rapporteringsperiodeId;
  const response = await lagKorrigeringsperiode(request, periodeId);

  if (response.ok) {
    const korrigeringsperiode: IRapporteringsperiode = await response.json();
    return redirect(`/korriger/${korrigeringsperiode.id}/fyll-ut`);
  } else {
    throw new Response(`Klarte ikke avgodkjenne periode med id: ${periodeId}`, { status: 500 });
  }
}
