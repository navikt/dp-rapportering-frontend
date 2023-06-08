import { Left } from "@navikt/ds-icons";
import { Heading } from "@navikt/ds-react";
import { RemixLink } from "~/components/RemixLink";
import styles from "./rapportering.module.css";

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
        <Heading level="2" size="xlarge">
          Du har sendt inn rapportering din.
        </Heading>
        <br />
        <RemixLink to="" as="Button" variant="secondary" icon={<Left />}>
          Gå til Mine side
        </RemixLink>
      </main>
    </div>
  );
}
