import { Heading } from "@navikt/ds-react";
import { DevTools } from "~/devTools";
import { useSanity } from "~/hooks/useSanity";

export function Header({ isLocalOrDemo }: { isLocalOrDemo: boolean }) {
  const { getAppText } = useSanity();
  return (
    <div className="rapportering-header">
      <div className="rapportering-header-innhold">
        <Heading tabIndex={-1} level="1" size="xlarge" className="vo-fokus">
          {getAppText("rapportering-tittel")}
        </Heading>
        {isLocalOrDemo && <DevTools />}
      </div>
    </div>
  );
}
