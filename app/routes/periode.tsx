import { Heading } from "@navikt/ds-react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Outlet } from "@remix-run/react";

export async function loader({ params }: LoaderFunctionArgs) {
  if (!params.rapporteringsperiodeId) {
    return redirect("/rapportering");
  }

  return json({});
}

export default function RapporteringsPeriode() {
  return (
    <>
      <div className="rapportering-header">
        <div className="rapportering-header-innhold">
          <Heading level="1" size="xlarge">
            Dagpengerapportering
          </Heading>
        </div>
      </div>
      <Outlet />
    </>
  );
}
