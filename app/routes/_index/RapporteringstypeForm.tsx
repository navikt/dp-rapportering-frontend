import { Radio, RadioGroup } from "@navikt/ds-react";
import { useFetcher } from "@remix-run/react";
import { Rapporteringstype } from "~/hooks/useRapporteringstype";
import { useSanity } from "~/hooks/useSanity";

interface RapporteringstypeFormProps {
  type: Rapporteringstype | undefined;
  setType: (value: Rapporteringstype) => void;
  rapporteringsperiodeId: string;
}

export function RapporteringstypeForm({
  type,
  setType,
  rapporteringsperiodeId,
}: RapporteringstypeFormProps) {
  const { getAppText } = useSanity();
  const fetcher = useFetcher();

  const handleChange = (valgtType: Rapporteringstype) => {
    if (type === undefined) {
      fetcher.submit({ rapporteringsperiodeId }, { method: "post", action: "api/start" });
    }
    setType(valgtType);
  };

  return (
    <RadioGroup
      legend={getAppText("rapportering-ikke-utfylte-rapporter-tittel")}
      description={getAppText("rapportering-ikke-utfylte-rapporter-subtittel")}
      onChange={handleChange}
      value={type}
    >
      <Radio value={Rapporteringstype.harAktivitet}>
        {getAppText("rapportering-noe-å-rapportere")}
      </Radio>
      <Radio value={Rapporteringstype.harIngenAktivitet}>
        {getAppText("rapportering-ingen-å-rapportere")}
      </Radio>
    </RadioGroup>
  );
}
