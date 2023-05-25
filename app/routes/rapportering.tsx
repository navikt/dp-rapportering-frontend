import { Alert, Heading } from "@navikt/ds-react";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { format, getISOWeek, subDays } from "date-fns";
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
  const rapporteringsperiodeResponse = await hentSisteRapporteringsperiode(
    "3fa85f64-5717-4562-b3fc-2c963f66afa6"
  );

  // Her må vi gjøre noe smartere
  // Per nå får vi et object med atributter med null i verdi
  const rapporteringsperiode = rapporteringsperiodeResponse.id
    ? rapporteringsperiodeResponse
    : null;

  return json({ rapporteringsperiode });
}

export default function Rapportering() {
  const { rapporteringsperiode } = useLoaderData<typeof loader>();

  if (!rapporteringsperiode) {
    return (
      <main className={styles.rapporteringKontainer}>
        <Alert variant="warning">Fant ikke rapporteringsperioder</Alert>
      </main>
    );
  }

  const { fraOgMed, tilOgMed } = rapporteringsperiode;

  function hentPeriodeDato() {
    const fom = format(new Date(fraOgMed), "dd.MM.yyyy");
    const tom = format(new Date(tilOgMed), "dd.MM.yyyy");

    return `(${fom} - ${tom})`;
  }

  function hentPeriodeUkenummer() {
    const forsteDagIAndreUke = subDays(new Date(tilOgMed), 7);
    const startUkenummer = getISOWeek(new Date(fraOgMed));
    const sluttUkenummer = getISOWeek(new Date(forsteDagIAndreUke));

    return `${startUkenummer} - ${sluttUkenummer}`;
  }

  return (
    <div id="dp-rapportering-frontend">
      <div className={styles.rapporteringHeader}>
        <div className={styles.rapporteringHeaderInnhold}>
          <Heading level="1" size="xlarge">
            Dagpengerapportering
          </Heading>
          <p>
            Uke {hentPeriodeUkenummer()} {hentPeriodeDato()}
          </p>
        </div>
      </div>
      <main className={styles.rapporteringKontainer}>
        <Outlet />
      </main>
    </div>
  );
}
