import type { SerializeFrom } from "@remix-run/node";
import { useNavigate, useRouteLoaderData } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { useSetFokus } from "~/hooks/useSetFokus";
import { useScrollToView } from "~/hooks/useSkrollTilSeksjon";
import type { loader } from "~/routes/rapportering.periode.$rapporteringsperiodeId";

export default function Rapportering() {
  const { periode } = useRouteLoaderData(
    "routes/rapportering.periode.$rapporteringsperiodeId"
  ) as SerializeFrom<typeof loader>;

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
    <div className="rapportering-kontainer">
      <p ref={sidelastFokusRef} tabIndex={-1} className="vo-fokus">
        Laster rapporteringsperiode
      </p>
    </div>
  );
}
