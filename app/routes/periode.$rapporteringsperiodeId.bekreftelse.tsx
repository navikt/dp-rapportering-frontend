import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { hentRapporteringsperioder } from "~/models/rapporteringsperiode.server";
import { useSanity } from "~/hooks/useSanity";
import { useTypedRouteLoaderData } from "~/hooks/useTypedRouteLoaderData";
import { Kvittering } from "~/components/Kvittering";

export async function loader({ request }: LoaderFunctionArgs) {
  const rapporteringsperioderResponse = await hentRapporteringsperioder(request);

  if (rapporteringsperioderResponse.ok) {
    const rapporteringsperioder = await rapporteringsperioderResponse.json();
    const harNestePeriode = rapporteringsperioder.length > 0;
    return json({ harNestePeriode });
  }

  return json({ harNestePeriode: false });
}

export default function RapporteringsPeriodesBekreftelsesSide() {
  const { harNestePeriode } = useLoaderData<typeof loader>();
  const { periode } = useTypedRouteLoaderData("routes/periode.$rapporteringsperiodeId");
  const { getAppText } = useSanity();

  return (
    <div className="rapportering-container">
      <Kvittering
        tittel={getAppText("rapportering-periode-bekreftelse-tittel")}
        periode={periode}
        harNestePeriode={harNestePeriode}
      />
    </div>
  );
}
