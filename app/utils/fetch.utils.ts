export function getHeaders(onBehalfOfToken: string) {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${onBehalfOfToken}`,
  };

  return headers;
}
