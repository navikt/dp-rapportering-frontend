export const aktivitetsTyper = ["Arbeid", "Syk", "Utdanning", "Fravaer"] as const;

export const aktivitetsTyperMap = (id: (typeof aktivitetsTyper)[number]) => {
  switch (id) {
    case "Fravaer":
      return "Fravær";
    default:
      return id;
  }
};
