import { Heading } from "@navikt/ds-react";
import type { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { formaterPeriodeDato, formaterPeriodeTilUkenummer } from "~/utils/dato.utils";
import styles from "./PeriodeHeaderDetaljer.module.css";

interface IProps {
  rapporteringsperiode: IRapporteringsperiode;
}

export function PeriodeHeaderDetaljer({ rapporteringsperiode }: IProps) {
  const { fraOgMed, tilOgMed } = rapporteringsperiode;

  return (
    <>
      <Heading level="3" size="small" className={styles.header}>
        {`Uke ${formaterPeriodeTilUkenummer(fraOgMed, tilOgMed)}`}
      </Heading>
      <span className="tekst-subtil">{formaterPeriodeDato(fraOgMed, tilOgMed)}</span>
    </>
  );
}
