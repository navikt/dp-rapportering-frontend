import { Heading } from "@navikt/ds-react";
import { json } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { hentSisteRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import styles from "./rapportering.module.css";

export function meta() {
  return [
    {
      title: "Dagpenger rapportering",
      description: "rapporteringløsning for dagpenger",
    },
  ];
}

export async function loader() {
  const rapporteringsperiodeResponse = await hentSisteRapporteringsperiode(
    "3fa85f64-5717-4562-b3fc-2c963f66afa6"
  );

  // Her må vi gjøre noe smartere
  // Per nå får vi et object med atributter med null i verdi
  const rapporteringsperiode = rapporteringsperiodeResponse.id
    ? rapporteringsperiodeResponse
    : null;

  return json({ rapporteringsperiode });
}

export default function Rapportering() {
  return (
    <div id="dp-rapportering-frontend">
      <div className={styles.rapporteringHeader}>
        <div className={styles.rapporteringHeaderInnhold}>
          <Heading level="1" size="xlarge">
            Dagpengerapportering
          </Heading>
          <p>Uke 43 - 44 (24.10.22 - 06.11.22)</p>
        </div>
      </div>

      <main className={styles.rapporteringKontainer}>
        <Outlet />
      </main>
    </div>
  );
}
