import { useNavigate } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { useSetFokus } from "~/hooks/useSetFokus";
import { useScrollToView } from "~/hooks/useSkrollTilSeksjon";
import { useTypedRouteLoaderData } from "~/hooks/useTypedRouteLoaderData";

export default function RapporteringsPeriodeSide() {
  const { periode } = useTypedRouteLoaderData(
    "routes/rapportering.periode.$rapporteringsperiodeId"
  );

  const navigate = useNavigate();

  const sidelastFokusRef = useRef(null);
  const { setFokus } = useSetFokus();
  const { scrollToView } = useScrollToView();

  useEffect(() => {
    scrollToView(sidelastFokusRef);
    setFokus(sidelastFokusRef);
  }, [setFokus, scrollToView]);

  useEffect(() => {
    if (periode) {
      switch (periode.status) {
        case "TilUtfylling":
          navigate(`/rapportering/periode/${periode.id}/fyll-ut`, { replace: true });
          break;
        default:
          navigate(`/rapportering/periode/${periode.id}/vis`, { replace: true });
      }
    } else {
      console.log("ingen periode i $rapporteringsperiode._index! :scream:");
    }
  }, [navigate, periode]);

  return (
    <div className="rapportering-container">
      <p ref={sidelastFokusRef} tabIndex={-1} className="vo-fokus">
        Laster rapporteringsperiode
      </p>
    </div>
  );
}
