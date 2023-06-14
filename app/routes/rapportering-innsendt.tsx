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
        <Heading level="2" size="small">
          Rapporteringen din er sendt inn til NAV.»
        </Heading>
        <br />
        <RemixLink
          to=""
          onClick={() => window.location.assign("https://www.nav.no/minside")}
          as="Button"
          variant="primary"
        >
          Gå til Mine side
        </RemixLink>
      </main>
    </div>
  );
}
