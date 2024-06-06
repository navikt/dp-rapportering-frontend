export const aktivitetType = ["Arbeid", "Syk", "Utdanning", "Fravaer"] as const;

export const aktivitetTypeMap = (id: (typeof aktivitetType)[number]) => {
  switch (id) {
    case "Fravaer":
      return "Fravær";
    default:
      return id;
  }
};
