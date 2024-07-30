import { Alert, Heading } from "@navikt/ds-react";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { hentRapporteringsperioder } from "~/models/rapporteringsperiode.server";
import { useSanity } from "~/hooks/useSanity";
import { useTypedRouteLoaderData } from "~/hooks/useTypedRouteLoaderData";
import { RemixLink } from "~/components/RemixLink";
import { AktivitetOppsummering } from "~/components/aktivitet-oppsummering/AktivitetOppsummering";
import { Kalender } from "~/components/kalender/Kalender";

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
  const { getAppText, getLink } = useSanity();

  return (
    <div className="rapportering-container">
      <Alert variant="success" className="my-4">
        <Heading spacing size="small" level="3">
          {getAppText("rapportering-periode-bekreftelse-tittel")}
        </Heading>
      </Alert>

      <div className="graa-bakgrunn">
        <Kalender rapporteringsperiode={periode} aapneModal={() => {}} readonly />
        <div className="registert-meldeperiode-container">
          <AktivitetOppsummering rapporteringsperiode={periode} />
        </div>
      </div>

      <div className="navigasjon-container">
        <RemixLink
          as="Button"
          to={getLink("rapportering-periode-bekreftelse-tilbake").linkUrl}
          className="py-4 px-8"
        >
          {harNestePeriode
            ? getLink("rapportering-periode-bekreftelse-neste").linkText
            : getLink("rapportering-periode-bekreftelse-tilbake").linkText}
        </RemixLink>
      </div>
    </div>
  );
}
