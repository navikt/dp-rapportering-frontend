import { type LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import { avGodkjennPeriode } from "~/models/rapporteringsperiode.server";
import { getRapporteringOboToken } from "~/utils/auth.utils.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  invariant(params.rapporteringsperiodeId, "params.rapporteringsperiode er påkrevd");

  const periodeId = params.rapporteringsperiodeId;
  const onBehalfOfToken = await getRapporteringOboToken(request);
  const response = await avGodkjennPeriode(onBehalfOfToken, periodeId);

  if (response.ok) {
    return redirect(`/periode/${periodeId}/fyll-ut`);
  } else {
    throw new Response(`Klarte ikke avgodkjenne periode med id: ${periodeId}`, { status: 500 });
  }
}
