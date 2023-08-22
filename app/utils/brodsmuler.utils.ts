import { setBreadcrumbs } from "@navikt/nav-dekoratoren-moduler";
import { getEnv } from "./env.utils";

interface Brodsmule {
  title: string;
  url: string;
}

export function lagBrodsmulesti(brodsmuler: Brodsmule[]) {
  const predefinerte = [
    {
      title: "Rapporteringsløsning for dagpenger",
      url: hentBrodsmuleUrl("/"),
    },
  ];

  const alleBrodsmuler = predefinerte.concat(brodsmuler);

  if (typeof document !== "undefined") {
    setBreadcrumbs(alleBrodsmuler);
  }
}

export function hentBrodsmuleUrl(routeFragment: string) {
  return getEnv("SELF_URL") + routeFragment;
}
