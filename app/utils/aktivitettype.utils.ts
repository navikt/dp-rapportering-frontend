export const aktivitetType = ["Arbeid", "Utdanning", "Syk", "Fravaer"] as const;

export const aktivitetTypeMap = (id: (typeof aktivitetType)[number]) => {
  switch (id) {
    case "Fravaer":
      return "Fravær";
    default:
      return id;
  }
};
