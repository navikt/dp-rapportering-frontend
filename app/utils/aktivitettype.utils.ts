import type { GetAppText } from "~/hooks/useSanity";

export enum AktivitetType {
  Arbeid = "Arbeid",
  Syk = "Syk",
  Fravaer = "Fravaer",
  Utdanning = "Utdanning",
}

export const aktivitetType = [
  AktivitetType.Arbeid,
  AktivitetType.Syk,
  AktivitetType.Fravaer,
  AktivitetType.Utdanning,
];

export interface IAktivitet {
  id?: string;
  type: AktivitetType;
  timer?: string;
}

export const aktivitetTypeMap = (id: AktivitetType, getAppText: GetAppText) => {
  switch (id) {
    case AktivitetType.Fravaer:
      return getAppText("rapportering-fraevaer");
    case AktivitetType.Utdanning:
      return getAppText("rapportering-utdanning");
    case AktivitetType.Arbeid:
      return getAppText("rapportering-arbeid");
    case AktivitetType.Syk:
      return getAppText("rapportering-syk");
    default:
      return id;
  }
};
