import { Heading } from "@navikt/ds-react";
import { Outlet } from "@remix-run/react";

export default function Korrigering() {
  return (
    <>
      <div className="rapportering-header">
        <div className="rapportering-header-innhold">
          <Heading level="1" size="xlarge">
            Korrigere rapportering
          </Heading>
        </div>
      </div>
      <Outlet />
    </>
  );
}
