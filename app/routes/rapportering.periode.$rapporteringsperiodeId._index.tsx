import { useNavigate, useRouteLoaderData } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { useScrollTilSeksjon } from "~/hooks/useScrollTilSeksjon";
import { useSetFokus } from "~/hooks/useSetFokus";
import type { IRapporteringsPeriodeLoader } from "~/routes/rapportering.periode.$rapporteringsperiodeId";

export default function Rapportering() {
  const { periode } = useRouteLoaderData(
    "routes/rapportering.periode.$rapporteringsperiodeId"
  ) as IRapporteringsPeriodeLoader;

  const navigate = useNavigate();

  const sidelastFokusRef = useRef(null);
  const { setFocus } = useSetFokus();
  const { scrollIntoView } = useScrollTilSeksjon();

  useEffect(() => {
    scrollIntoView(sidelastFokusRef);
    setFocus(sidelastFokusRef);
  }, []);

  useEffect(() => {
    if (periode) {
      switch (periode.status) {
        case "TilUtfylling":
          console.log("naviger til utfylling!");
          navigate(`/rapportering/periode/${periode.id}/fyll-ut`, { replace: true });
          break;
        default:
          console.log("naviger til view");
          navigate(`/rapportering/periode/${periode.id}/vis`, { replace: true });
      }
    } else {
      console.log("ingen periode i $rapporteringsperiode._index! :scream:");
    }
  }, [navigate, periode]);

  return (
    <main className="rapportering-kontainer">
      <p ref={sidelastFokusRef} tabIndex={-1} className="VO-fokus">
        Laster rapporteringsperiode
      </p>
    </main>
  );
}
