import { Radio, RadioGroup } from "@navikt/ds-react";
import { useFetcher } from "@remix-run/react";
import { Rapporteringstype } from "~/utils/types";
import { useSanity } from "~/hooks/useSanity";

interface RapporteringstypeFormProps {
  rapporteringstype: Rapporteringstype | undefined;
  rapporteringsperiodeId: string;
}

export function RapporteringstypeForm({
  rapporteringstype,
  rapporteringsperiodeId,
}: RapporteringstypeFormProps) {
  const { getAppText } = useSanity();
  const fetcher = useFetcher();

  const handleChange = (valgtType: Rapporteringstype) => {
    if (rapporteringstype === undefined) {
      fetcher.submit({ rapporteringsperiodeId }, { method: "post", action: "api/start" });
    }

    fetcher.submit({ rapporteringstype: valgtType }, { method: "post" });
  };

  return (
    <RadioGroup
      legend={getAppText("rapportering-ikke-utfylte-rapporter-tittel")}
      description={getAppText("rapportering-ikke-utfylte-rapporter-subtittel")}
      onChange={handleChange}
      value={rapporteringstype || ""}
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
