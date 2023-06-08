import { Alert, Heading } from "@navikt/ds-react";
import styles from "./rapportering.module.css";
import { RemixLink } from "~/components/RemixLink";
import { Left } from "@navikt/ds-icons";

export default function RapporteringSendt() {
  return (
    <div id="dp-rapportering-frontend">
      <div className={styles.rapporteringHeader}>
        <div className={styles.rapporteringHeaderInnhold}>
          <Heading level="1" size="xlarge">
            Dagpengerapportering
          </Heading>
        </div>
      </div>
      <main className={styles.rapporteringKontainer}>
        <Alert variant="success">Du har sendt inn din rapportering.</Alert>
        <br />
        <RemixLink to="" as="Button" variant="secondary" icon={<Left />}>
          Mine side
        </RemixLink>
      </main>
    </div>
  );
}
