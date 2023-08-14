import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import type { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { hentAllePerioder } from "~/models/rapporteringsperiode.server";
import { useLoaderData } from "@remix-run/react";
import styles from "~/routes/rapportering.module.css";
import { Heading } from "@navikt/ds-react";
import { Kalender } from "~/components/kalender/Kalender";
import classNames from "classnames";

export async function loader({ request }: LoaderArgs) {
  const allePerioderResponse = await hentAllePerioder(request);

  if(allePerioderResponse.ok) {
    const allePerioder = await allePerioderResponse.json();

    return json({ allePerioder });
  }
  else {
    throw new Response(
      `Feil i uthenting av alle rapporteringsperioder`,
      { status: 500 },
    );
  }
}

export default function RapporteringAlle() {
  const { allePerioder } = useLoaderData<typeof loader>();
  const perioder = allePerioder as IRapporteringsperiode[];

  return (
    <>
      <div className={styles.rapporteringHeader}>
        <div className={styles.rapporteringHeaderInnhold}>
          <Heading level="1" size="xlarge">
            Tidligere rapporteringer for dagpenger
          </Heading>
        </div>
      </div>
      <main className={styles.rapporteringKontainer}>
        <Heading size={"medium"} level={"2"}>
          Oversikt over tidligere rapporteringer
        </Heading>
        <p>Her kan du se alle tidligere rapportertinger du har sendt til NAV.</p>
        {perioder.map((periode) => {
          return (
            <div className={classNames([styles.graaBakgrunn])} key={periode.id}>
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
