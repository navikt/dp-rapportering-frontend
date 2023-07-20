import type { LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import type { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { hentGjeldendePeriode } from "~/models/rapporteringsperiode.server";

export async function loader({ request }: LoaderArgs) {
  let gjeldendePeriode = null;
  const gjeldendePeriodeResponse = await hentGjeldendePeriode(request);
  console.log("index loader");

  if (gjeldendePeriodeResponse.ok) {
    gjeldendePeriode = await gjeldendePeriodeResponse.json();
    gjeldendePeriode as IRapporteringsperiode;
    if (gjeldendePeriode.status === "TilUtfylling") {
      return redirect(`periode/${gjeldendePeriode.id}`);
    }
  }
  return redirect("alle");
}
