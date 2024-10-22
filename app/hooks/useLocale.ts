import { useTypedRouteLoaderData } from "./useTypedRouteLoaderData";
import { useMemo } from "react";

export function useLocale() {
  const { locale } = useTypedRouteLoaderData("root");

  return useMemo(() => ({ locale }), [locale]);
}
