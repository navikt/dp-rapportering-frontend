import { json } from "@remix-run/node";

export async function loader() {
  return json({ status: 200, statusText: "Alive" });
}
