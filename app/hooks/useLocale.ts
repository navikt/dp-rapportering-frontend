import { useTypedRouteLoaderData } from "./useTypedRouteLoaderData";

export function useLocale() {
  const { locale } = useTypedRouteLoaderData("root");

  return { locale };
}
