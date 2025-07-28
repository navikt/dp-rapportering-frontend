import { useEffect } from "react";
import { useNavigate } from "react-router";

import { useSanity } from "~/hooks/useSanity";
import { useTypedRouteLoaderData } from "~/hooks/useTypedRouteLoaderData";

export default function RapporteringsPeriodeSide() {
  const { periode } = useTypedRouteLoaderData("routes/periode.$rapporteringsperiodeId");

  const { getAppText } = useSanity();
  const navigate = useNavigate();

  useEffect(() => {
    if (periode) {
      navigate(`/periode/${periode.id}/fyll-ut`, { replace: true });
    } else {
      navigate(`/`, { replace: true });
    }
  }, [navigate, periode]);

  return (
    <div className="rapportering-container">
      <p tabIndex={-1} className="vo-fokus">
        {getAppText("rapportering-periode-laster")}
      </p>
    </div>
  );
}
