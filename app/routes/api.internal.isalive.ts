export async function loader() {
  return Response.json({ status: 200, statusText: "Alive" });
}
