import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { hentGjeldendePeriode } from "~/models/rapporteringsperiode.server";
import styles from "~/routes/rapportering.module.css";
import { BodyLong, Heading } from "@navikt/ds-react";
import { useLoaderData } from "@remix-run/react";
import { RemixLink } from "~/components/RemixLink";
import { formaterPeriodeDato, formaterPeriodeTilUkenummer } from "~/utils/dato.utils";
import { format } from "date-fns";
import nbLocale from "date-fns/locale/nb";

export async function loader({ request }: LoaderArgs) {
  const gjeldendePeriodeResponse = await hentGjeldendePeriode(request);
  console.log("index loader");

  if (gjeldendePeriodeResponse.ok) {
    const periode = await gjeldendePeriodeResponse.json();
    return json(periode);
  }
  console.log("gjeldende periode response er ikke ok: ", gjeldendePeriodeResponse);
  return json({ ingenperiode: true });
}

export default function RapporteringsLandingside() {
  const data = useLoaderData<typeof loader>();
  return (
    <>
      <div className={styles.rapporteringHeader}>
        <div className={styles.rapporteringHeaderInnhold}>
          <Heading level="1" size="xlarge">
            Dine dagpenger
          </Heading>
        </div>
      </div>
      <main className={styles.rapporteringKontainer}>
        <BodyLong>
          For å kunne motta dagpenger må du rapportere hver for hver dagpengeperiode. Periodene
          varer i to uke fra det tidspunktet du har søkt om dagpenger.
        </BodyLong>
        <p>
          <RemixLink as={"Link"} to={"/rapportering/alle"}>
            Se og korriger tidligere rapporteringer
          </RemixLink>
        </p>
        <Heading size={"medium"}>Inneværende dagpengerapportering</Heading>
        {data.ingenperiode && <>Du har ingen perioder å rapportere</>}
        {!data.ingenperiode && data.id && (
          <>
            <span>
              Uke {formaterPeriodeTilUkenummer(data.fraOgMed, data.tilOgMed)} (
              {formaterPeriodeDato(data.fraOgMed, data.tilOgMed)})
            </span>
            <div className={styles.navigasjonKontainer}>
              <RemixLink as={"Button"} to={`/rapportering/periode/${data.id}/fyllut`}>
                Rapporter for perioden
              </RemixLink>
              <p>
                Frist for rapportering:{" "}
                {format(new Date(data.beregnesEtter), "EEEE d. MMMM", { locale: nbLocale })}
              </p>
            </div>
          </>
        )}
      </main>
    </>
  );
}
