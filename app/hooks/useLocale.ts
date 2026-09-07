import { useMemo } from "react";
import { useRouteLoaderData } from "react-router";

import type { loader as RootLoader } from "~/root";
import { DecoratorLocale, getLocale } from "~/utils/dekoratoren.utils";

export function useLocale() {
  // Root loader kan mangle data her (f.eks. hvis root sin egen loader feilet og GeneralErrorBoundary rendres)
  const rootData = useRouteLoaderData<typeof RootLoader>("root");
  const locale = rootData?.locale ?? getLocale(DecoratorLocale.NB);

  return useMemo(() => ({ locale }), [locale]);
}
