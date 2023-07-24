import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import type { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { hentAllePerioder } from "~/models/rapporteringsperiode.server";
import { useLoaderData } from "@remix-run/react";
import styles from "~/routes/rapportering.module.css";
import { Heading } from "@navikt/ds-react";
import { Kalender } from "~/components/kalender/Kalender";
import { visGraaBakgrunn } from "~/utils/css.utils";

export async function loader({ request }: LoaderArgs) {
  console.log("rapportering/alle loader");
  let allePerioder = null;

  const allePerioderResponse = await hentAllePerioder(request);

  if (allePerioderResponse.ok) {
    allePerioder = await allePerioderResponse.json();
  } else {
    const { status, statusText } = allePerioderResponse;
    throw json({}, { status, statusText });
  }

  return json({ allePerioder });
}

export default function RapporteringAlle() {
  const { allePerioder } = useLoaderData<typeof loader>();
  const perioder = allePerioder as IRapporteringsperiode[];

  return (
    <>
      <div className={styles.rapporteringHeader}>
        <div className={styles.rapporteringHeaderInnhold}>
          <Heading level="1" size="xlarge">
            Dagpengerapportering
          </Heading>
        </div>
      </div>
      <main className={styles.rapporteringKontainer}>
        {perioder.map((periode) => {
          return (
            <div className={visGraaBakgrunn(periode.status)} key={periode.id}>
              <Kalender
                rapporteringsperiode={periode as IRapporteringsperiode}
                aapneModal={() => {}}
                visRedigeringsAlternativer={true}
              />
            </div>
          );
        })}
      </main>
    </>
  );
}
