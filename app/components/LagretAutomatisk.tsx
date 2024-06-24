import { FileCheckmarkIcon } from "@navikt/aksel-icons";
import { Detail } from "@navikt/ds-react";
import { useSanity } from "~/hooks/useSanity";

export function LagretAutomatisk() {
  const { getAppText } = useSanity();
  return (
    <div className="lagret-automatisk">
      <FileCheckmarkIcon title="a11y-title" fontSize="1.5rem" />
      <Detail>{getAppText("rapportering-automatisk-lagring")}</Detail>
    </div>
  );
}
