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
  const rapporteringsperiode = await hentSisteRapporteringsperiode();

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
