import { isRouteErrorResponse, Outlet, useRouteError } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getSession } from "~/utils/auth.utils.server";
import { SessjonModal } from "~/components/session-modal/SessjonModal";
import styles from "~/routes/rapportering.module.css";
import { Heading } from "@navikt/ds-react";
import type { SessionWithOboProvider } from "@navikt/dp-auth";

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
