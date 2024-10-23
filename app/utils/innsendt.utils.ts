import type { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";

export function sorterGrupper(gruppe: IRapporteringsperiode[]): IRapporteringsperiode[] {
  return gruppe.sort((a, b) => {
    if (a.originalId && !b.originalId) {
      return -1;
    }

    if (b.originalId && !a.originalId) {
      return 1;
    }

    if (a.id === b.originalId) {
      return -1;
    }

    if (b.id === a.originalId) {
      return 1;
    }

    return (b.mottattDato || "").localeCompare(a.mottattDato || "");
  });
}
