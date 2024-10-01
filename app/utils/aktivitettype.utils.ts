import type { GetAppText } from "~/hooks/useSanity";

export const aktivitetType = ["Arbeid", "Syk", "Fravaer", "Utdanning"] as const;

export const aktivitetTypeMap = (id: (typeof aktivitetType)[number], getAppText: GetAppText) => {
  switch (id) {
    case "Fravaer":
      return getAppText("rapportering-fraevaer");
    case "Utdanning":
      return getAppText("rapportering-utdanning");
    case "Arbeid":
      return getAppText("rapportering-arbeid");
    default:
      return id;
  }
};
