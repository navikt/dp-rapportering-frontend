import { useRouteLoaderData } from "@remix-run/react";
import classNames from "classnames";
import { AktivitetOppsummering } from "~/components/aktivitet-oppsummering/AktivitetOppsummering";
import { Kalender } from "~/components/kalender/Kalender";
import type { IRapporteringsPeriodeLoader } from "~/routes/rapportering.periode.$rapporteringsperiodeId";

export default function RapporteringLes() {
  const { periode } = useRouteLoaderData(
    "routes/rapportering.periode.$rapporteringsperiodeId"
  ) as IRapporteringsPeriodeLoader;

  return (
    <>
      <main
        className={classNames("rapportering-kontainer", {
          "graa-bakgrunn": periode.status !== "TilUtfylling",
        })}
      >
        <Kalender rapporteringsperiode={periode} aapneModal={() => {}} readonly />
        <div className="registert-meldeperiode-kontainer">
          <AktivitetOppsummering rapporteringsperiode={periode} />
        </div>
      </main>
    </>
  );
}
