import { ReactNode, createContext, useContext, useState } from "react";

export enum RapporteringType {
  harAktivitet = "harAktivitet",
  harIngenAktivitet = "harIngenAktivitet",
}

interface RapporteringTypeContextProps {
  rapporteringType: RapporteringType | undefined;
  setRapporteringType: (type: RapporteringType) => void;
}

const RapporteringTypeContext = createContext<RapporteringTypeContextProps | undefined>(undefined);

export const RapporteringTypeProvider = ({ children }: { children: ReactNode }) => {
  const [rapporteringType, setRapporteringType] = useState<RapporteringType | undefined>();

  return (
    <RapporteringTypeContext.Provider value={{ rapporteringType, setRapporteringType }}>
      {children}
    </RapporteringTypeContext.Provider>
  );
};

export const useRapporteringType = () => {
  const context = useContext(RapporteringTypeContext);
  if (!context) {
    throw new Error("useRapporteringTypeContext must be used within a RapporteringTypeProvider");
  }
  return context;
};
