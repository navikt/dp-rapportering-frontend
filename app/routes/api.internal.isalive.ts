export async function loader() {
  return Response.json(null, { status: 200, statusText: "Alive" });
}
