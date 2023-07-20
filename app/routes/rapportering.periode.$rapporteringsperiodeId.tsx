import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { hentPeriode, IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import invariant from "tiny-invariant";
import { useLoaderData } from "@remix-run/react";

export async function loader({ request, params }: LoaderArgs) {
  console.log("rapportering/alle loader");
  invariant(params.rapporteringsperiodeId, `params.rapporteringsperiode er påkrevd`);
  let periodeId = params.rapporteringsperiodeId;
  let periode = null;

  const periodeResponse = await hentPeriode(request, periodeId);
  if (periodeResponse.ok) {
    periode = await periodeResponse.json();
    return json({ periode });
  } else {
    const { status, statusText } = periodeResponse;
    throw new Response("IIIH NOE GIKK GALT VED UTHENTING AV PERIODE", { status, statusText });
  }
}

export default function Rapportering() {
  const { periode } = useLoaderData<typeof loader>();
  return <p>Henter ut periodedata</p>;
}
