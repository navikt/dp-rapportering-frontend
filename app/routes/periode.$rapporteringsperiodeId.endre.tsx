import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import type { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { lagEndringsperiode } from "~/models/rapporteringsperiode.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  invariant(params.rapporteringsperiodeId, "rapportering-feilmelding-periode-id-mangler-i-url");

  const periodeId = params.rapporteringsperiodeId;

  const response = await lagEndringsperiode(request, periodeId);
  const { id }: IRapporteringsperiode = response;
  return redirect(`/periode/${id}/endring/fyll-ut`);
}
