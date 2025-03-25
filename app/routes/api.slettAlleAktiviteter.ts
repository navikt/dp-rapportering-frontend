import { ActionFunctionArgs } from "@remix-run/node";

import { slettAlleAktiviteterForEnHelPeriode } from "~/utils/aktiviteter.action.server";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const rapporteringsPeriode = formData.get("periode") as string;

  return slettAlleAktiviteterForEnHelPeriode(request, JSON.parse(rapporteringsPeriode));
}
