import { ReactNode, createContext, useContext, useState } from "react";

export enum Rapporteringstype {
  harAktivitet = "harAktivitet",
  harIngenAktivitet = "harIngenAktivitet",
}

interface RapporteringstypeContextProps {
  rapporteringstype: Rapporteringstype | undefined;
  setRapporteringstype: (type: Rapporteringstype) => void;
}

const RapporteringstypeContext = createContext<RapporteringstypeContextProps | undefined>(
  undefined
);

export const RapporteringstypeProvider = ({ children }: { children: ReactNode }) => {
  const [rapporteringstype, setRapporteringstype] = useState<Rapporteringstype | undefined>();

  return (
    <RapporteringstypeContext.Provider value={{ rapporteringstype, setRapporteringstype }}>
      {children}
    </RapporteringstypeContext.Provider>
  );
};

export const useRapporteringstype = () => {
  const context = useContext(RapporteringstypeContext);
  if (!context) {
    throw new Error("useRapporteringstypeContext must be used within a RapporteringstypeProvider");
  }
  return context;
};
