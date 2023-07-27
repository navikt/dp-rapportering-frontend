import { Heading } from "@navikt/ds-react";
import { Outlet } from "@remix-run/react";
import styles from "~/routes/rapportering.module.css";

export default function Korrigering() {
  return (
    <>
      <div className={styles.rapporteringHeader}>
        <div className={styles.rapporteringHeaderInnhold}>
          <Heading level="1" size="xlarge">
            Korrigering av dagpenger
          </Heading>
        </div>
      </div>
      <Outlet />
    </>
  );
}
