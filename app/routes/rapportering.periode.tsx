import { Outlet } from "@remix-run/react";
import styles from "~/routes/rapportering.module.css";
import { Heading } from "@navikt/ds-react";

export default function RapporteringsPeriode() {
  return (
    <>
      <div className={styles.rapporteringHeader}>
        <div className={styles.rapporteringHeaderInnhold}>
          <Heading level="1" size="xlarge">
            Dagpengerapportering
          </Heading>
        </div>
      </div>
      <Outlet />
    </>
  );
}
