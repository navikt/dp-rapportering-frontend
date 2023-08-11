import type { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { formaterPeriodeDato, formaterPeriodeTilUkenummer } from "~/utils/dato.utils";
import { Heading } from "@navikt/ds-react";
import { format } from "date-fns";
import styles from "./PeriodeHeaderDetaljer.module.css";
import nbLocale from "date-fns/locale/nb";

interface IProps {
  rapporteringsperiode: IRapporteringsperiode;
}

export function PeriodeHeaderDetaljer({ rapporteringsperiode }: IProps) {
  const { fraOgMed, tilOgMed, beregnesEtter, status } = rapporteringsperiode;

  return (
    <>
      <Heading level="3" size="small" className={styles.header}>
        {`Uke ${formaterPeriodeTilUkenummer(fraOgMed, tilOgMed)}`}
      </Heading>
      <span className="subtile">{formaterPeriodeDato(fraOgMed, tilOgMed)}</span>
      {(status === "TilUtfylling" || status === "Godkjent") && (
        <p className="subtile">
          Beregnes etter: {format(new Date(beregnesEtter), "EEEE d. MMMM", { locale: nbLocale })}
        </p>
      )}
    </>
  );
}
