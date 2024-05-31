import { Heading } from "@navikt/ds-react";
import { Outlet } from "@remix-run/react";
import { useSanity } from "~/hooks/useSanity";

export default function Korrigering() {
  const { getAppText } = useSanity();

  return (
    <>
      <div className="rapportering-header">
        <div className="rapportering-header-innhold">
          <Heading level="1" size="xlarge">
            {getAppText("rapportering-korriger-tittel")}
          </Heading>
        </div>
      </div>
      <Outlet />
    </>
  );
}
