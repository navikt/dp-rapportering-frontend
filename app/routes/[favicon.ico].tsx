import { readFileSync } from "fs";

const __dirname = import.meta.dirname;

export async function loader() {
  const file = readFileSync(__dirname + "/../client/favicon.ico");

  return new Response(file, {
    status: 200,
    headers: {
      "Content-Type": "image/x-icon",
    },
  });
}
