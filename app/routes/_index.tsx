import { redirect } from "@remix-run/router";

export async function loader() {
  return redirect("/rapp");
}
