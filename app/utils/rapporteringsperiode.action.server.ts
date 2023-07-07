import { json, redirect } from "@remix-run/node";
import { IRapporteringsperiode, startKorrigering } from "~/models/rapporteringsperiode.server";

export async function startKorrigeringAction(formdata: FormData, request: Request) {
  const periodeId = formdata.get("periode-id") as string;

  const korrigeringResponse = await startKorrigering(periodeId, request);

  if (korrigeringResponse.ok) {
    const korrigeringsperiode: IRapporteringsperiode = await korrigeringResponse.json();
    return redirect(`/rapportering/endre/${korrigeringsperiode.id}`);
  } else {
    json({ korrigeringsfeil: true });
  }
}
