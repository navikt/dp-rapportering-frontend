import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { hentRapporteringsperioder } from "~/models/rapporteringsperiode.server";
import { perioderSomKanSendes } from "~/utils/periode.utils";
import { useSanity } from "~/hooks/useSanity";
import { useTypedRouteLoaderData } from "~/hooks/useTypedRouteLoaderData";
import { Kvittering } from "~/components/Kvittering";

export async function loader({ request }: LoaderFunctionArgs) {
  const rapporteringsperioder = await hentRapporteringsperioder(request);
  const harNestePeriode = perioderSomKanSendes(rapporteringsperioder).length > 0;

  return json({ harNestePeriode });
}

export default function RapporteringsPeriodesBekreftelsesSide() {
  const { harNestePeriode } = useLoaderData<typeof loader>();
  const { periode } = useTypedRouteLoaderData("routes/periode.$rapporteringsperiodeId");
  const { getAppText } = useSanity();

  return (
    <Kvittering
      tittel={getAppText("rapportering-periode-bekreftelse-tittel")}
      periode={periode}
      harNestePeriode={harNestePeriode}
    />
  );
}
