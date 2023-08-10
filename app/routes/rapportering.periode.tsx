import { Heading } from "@navikt/ds-react";
import { Outlet } from "@remix-run/react";
import sharedStyles from "~/routes-styles/shared-styles.module.css";

export default function RapporteringsPeriode() {
  return (
    <>
      <div className={sharedStyles.rapporteringHeader}>
        <div className={sharedStyles.rapporteringHeaderInnhold}>
          <Heading level="1" size="xlarge">
            Dagpengerapportering
          </Heading>
        </div>
      </div>
      <Outlet />
    </>
  );
}
