import { type SerializeFrom } from "@remix-run/node";
import { useRouteLoaderData } from "@remix-run/react";
import classNames from "classnames";
import { AktivitetOppsummering } from "~/components/aktivitet-oppsummering/AktivitetOppsummering";
import { Kalender } from "~/components/kalender/Kalender";
import { type loader } from "~/routes/rapportering.periode.$rapporteringsperiodeId";

export default function RapporteringLes() {
  const { periode } = useRouteLoaderData(
    "routes/rapportering.periode.$rapporteringsperiodeId"
  ) as SerializeFrom<typeof loader>;

  return (
    <div
      className={classNames("rapportering-kontainer", {
        "graa-bakgrunn": periode.status !== "TilUtfylling",
      })}
    >
      <Kalender rapporteringsperiode={periode} aapneModal={() => {}} readonly />
      <div className="registert-meldeperiode-kontainer">
        <AktivitetOppsummering rapporteringsperiode={periode} />
      </div>
    </div>
  );
}
