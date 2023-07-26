import type { LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { hentGjeldendePeriode } from "~/models/rapporteringsperiode.server";

export async function loader({ request }: LoaderArgs) {
  const gjeldendePeriodeResponse = await hentGjeldendePeriode(request);
  console.log("index loader");

  if (gjeldendePeriodeResponse.ok) {
    const gjeldendePeriode = await gjeldendePeriodeResponse.json();

    if (gjeldendePeriode!.status === "TilUtfylling") {
      return redirect(`periode/${gjeldendePeriode.id}`);
    }
  }
  return redirect("alle");
}
