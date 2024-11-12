import type { LoaderFunctionArgs, TypedResponse } from "@remix-run/node";
import { redirect } from "@remix-run/node";

export async function loader({ params }: LoaderFunctionArgs): Promise<TypedResponse<object>> {
  if (!params.rapporteringsperiodeId) {
    return redirect("/");
  }

  return Response.json({});
}
