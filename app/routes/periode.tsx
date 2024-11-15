import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";

export async function loader({ params }: LoaderFunctionArgs) {
  if (!params.rapporteringsperiodeId) {
    return redirect("/");
  }

  return json({});
}
