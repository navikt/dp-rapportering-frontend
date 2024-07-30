export const aktivitetType = ["Arbeid", "Syk", "Fravaer", "Utdanning"] as const;

export const aktivitetTypeMap = (id: (typeof aktivitetType)[number]) => {
  switch (id) {
    case "Fravaer":
      return "Fravær";
    case "Utdanning":
      return "Tiltak / kurs / utdanning";
    default:
      return id;
  }
};
