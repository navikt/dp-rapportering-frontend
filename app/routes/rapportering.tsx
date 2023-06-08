import { Accordion, Alert, Heading } from "@navikt/ds-react";
import { json, type LoaderArgs } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import {
  IRapporteringsperiode,
  hentSisteRapporteringsperiode,
} from "~/models/rapporteringsperiode.server";
import { formaterPeriodeDato, formaterPeriodeTilUkenummer } from "~/utils/dato.utils";

import styles from "./rapportering.module.css";

export async function loader({ request }: LoaderArgs) {
  const rapporteringsperiodeResponse = await hentSisteRapporteringsperiode(
    "gjeldende", // TODO: Dette bør vel helst være smartere 😅
    request
  );

  // Her må vi gjøre noe smartere
  // Per nå får vi et object med atributter med null i verdi
  const rapporteringsperiode = rapporteringsperiodeResponse.id
    ? rapporteringsperiodeResponse
    : null;

  return json({ rapporteringsperiode });
}

export interface IRapporteringLoader {
  rapporteringsperiode: IRapporteringsperiode;
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
        <Accordion className={styles.debug}>
          <Accordion.Item>
            <Accordion.Header>(DEBUG) Rapporteringsperiode som json:</Accordion.Header>
            <Accordion.Content>
              <pre>${JSON.stringify(rapporteringsperiode, null, 2)}</pre>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion>
      </main>
    </div>
  );
}
