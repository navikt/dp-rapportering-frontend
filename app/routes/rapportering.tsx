import { Alert, Heading } from "@navikt/ds-react";
import { LoaderArgs, json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { hentSisteRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { formaterPeriodeDato, formaterPeriodeTilUkenummer } from "~/utils/dato.utils";

import styles from "./rapportering.module.css";

export function meta() {
  return [
    {
      title: "Dagpenger rapportering",
      description: "rapporteringløsning for dagpenger",
    },
  ];
}

export async function loader({ request }: LoaderArgs) {
  const rapporteringsperiodeResponse = await hentSisteRapporteringsperiode(
    "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    request
  );

  // Her må vi gjøre noe smartere
  // Per nå får vi et object med atributter med null i verdi
  const rapporteringsperiode = rapporteringsperiodeResponse.id
    ? rapporteringsperiodeResponse
    : null;

  return json({ rapporteringsperiode: null });
}

export default function Rapportering() {
  const { rapporteringsperiode } = useLoaderData<typeof loader>();

  if (!rapporteringsperiode) {
    return (
      <main className={styles.rapporteringKontainer}>
        <Alert variant="warning">Fant ikke rapporteringsperioder</Alert>
      </main>
    );
  }

  const { fraOgMed, tilOgMed } = rapporteringsperiode;

  return (
    <div id="dp-rapportering-frontend">
      <div className={styles.rapporteringHeader}>
        <div className={styles.rapporteringHeaderInnhold}>
          <Heading level="1" size="xlarge">
            Dagpengerapportering
          </Heading>
          <p>
            Uke {formaterPeriodeTilUkenummer(fraOgMed, tilOgMed)} (
            {formaterPeriodeDato(fraOgMed, tilOgMed)})
          </p>
        </div>
      </div>
      <main className={styles.rapporteringKontainer}>
        <Outlet />
      </main>
    </div>
  );
}
