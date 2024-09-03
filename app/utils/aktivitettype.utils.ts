export const aktivitetType = ["Arbeid", "Syk", "Fravaer", "Utdanning"] as const;

// TODO: Hent tekster fra Sanity
export const aktivitetTypeMap = (id: (typeof aktivitetType)[number]) => {
  switch (id) {
    case "Fravaer":
      return "Ferie eller fravær";
    case "Utdanning":
      return "Tiltak / kurs / utdanning";
    case "Arbeid":
      return "Jobb";
    default:
      return id;
  }
};
