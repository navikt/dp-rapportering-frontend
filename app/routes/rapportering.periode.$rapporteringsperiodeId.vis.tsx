import classNames from "classnames";
import { AktivitetOppsummering } from "~/components/aktivitet-oppsummering/AktivitetOppsummering";
import { Kalender } from "~/components/kalender/Kalender";
import { useTypedRouteLoaderData } from "~/hooks/useTypedRouteLoaderData";

export default function RapporteringLes() {
  const { periode } = useTypedRouteLoaderData(
    "routes/rapportering.periode.$rapporteringsperiodeId"
  );

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
