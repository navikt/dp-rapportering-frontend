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
      console.log("useEffect har rapporteringsperiode!", periode);
      switch (periode.status) {
        case "TilUtfylling":
          console.log("til utfylling!");
          break;
        default:
          console.log("ikke til utfylling!");
          navigate(`rapportering/periode/${periode.id}/les`);
      }
    } else {
      console.log("if test feilet");
    }
  }, [periode]);

  return (
    <main className={styles.rapporteringKontainer}>
      <p>Laster rapporteringsperiode</p>
    </main>
  );
}
