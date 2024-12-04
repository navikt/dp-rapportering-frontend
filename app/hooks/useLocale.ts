import { useMemo } from "react";

import { useTypedRouteLoaderData } from "./useTypedRouteLoaderData";

export function useLocale() {
  const { locale } = useTypedRouteLoaderData("root");

  return useMemo(() => ({ locale }), [locale]);
}
