import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";

export async function loader({ params }: LoaderFunctionArgs) {
  if (!params.rapporteringsperiodeId) {
    return redirect("/");
  }

  return {};
}
