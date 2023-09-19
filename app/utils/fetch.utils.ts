export function getHeader(onBehalfOfToken: string) {
  const header = {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${onBehalfOfToken}`,
  };

  return header;
}
