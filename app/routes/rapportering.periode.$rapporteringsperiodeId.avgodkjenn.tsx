import type { LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import { avGodkjennPeriode } from "~/models/rapporteringsperiode.server";
import { getOboToken } from "~/utils/auth.utils.server";

export async function loader({ request, params }: LoaderArgs) {
  invariant(params.rapporteringsperiodeId, "params.rapporteringsperiode er påkrevd");

  const onBehalfOfToken = await getOboToken(request);
  const periodeId = params.rapporteringsperiodeId;
  const response = await avGodkjennPeriode(onBehalfOfToken, periodeId);

  if (response.ok) {
    return redirect(`/rapportering/periode/${periodeId}/fyll-ut`);
  } else {
    throw new Response(`Klarte ikke avgodkjenne periode med id: ${periodeId}`, { status: 500 });
  }
}
