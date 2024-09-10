export const aktivitetType = ["Arbeid", "Syk", "Fravaer", "Utdanning"] as const;

export const aktivitetTypeMap = (
  id: (typeof aktivitetType)[number],
  getAppText: (textId: string) => string
) => {
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
