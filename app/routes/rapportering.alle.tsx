import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { hentAllePerioder, IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { useLoaderData } from "@remix-run/react";
import styles from "~/routes/rapportering.module.css";
import { Heading, Loader } from "@navikt/ds-react";
import { Kalender } from "~/components/kalender/Kalender";

export async function loader({ request }: LoaderArgs) {
  console.log("rapportering/alle loader");
  let allePerioder = null;
  let error = null;

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
      <main>
        {perioder.map((periode) => {
          return (
            <Kalender
              rapporteringsperiode={periode as IRapporteringsperiode}
              aapneModal={() => {}}
              key={periode.id}
            />
          );
        })}
      </main>
    </>
  );
}
