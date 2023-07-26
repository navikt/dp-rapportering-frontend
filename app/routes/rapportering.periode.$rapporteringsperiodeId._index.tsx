import { useNavigate, useRouteLoaderData } from "@remix-run/react";
import styles from "~/routes/rapportering.module.css";
import type { IRapporteringsPeriodeLoader } from "~/routes/rapportering.periode.$rapporteringsperiodeId";
import { useEffect } from "react";

export default function Rapportering() {
  const { periode } = useRouteLoaderData(
    "routes/rapportering.periode.$rapporteringsperiodeId"
  ) as IRapporteringsPeriodeLoader;

  const navigate = useNavigate();

  useEffect(() => {
    if (periode) {
      switch (periode.status) {
        case "TilUtfylling":
          console.log("naviger til utfylling!");
          navigate(`rapportering/periode/${periode.id}/fyllut`);
          break;
        default:
          console.log("naviger til view");
          navigate(`rapportering/periode/${periode.id}/vis`);
      }
    } else {
      console.log("ingen periode i $rapporteringsperiode._index! :scream:");
    }
  }, [navigate, periode]);

  return (
    <main className={styles.rapporteringKontainer}>
      <p>Laster rapporteringsperiode</p>
    </main>
  );
}
