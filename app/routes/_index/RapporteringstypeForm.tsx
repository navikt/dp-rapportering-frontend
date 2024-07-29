import { Radio, RadioGroup } from "@navikt/ds-react";
import { useFetcher } from "@remix-run/react";
import { Rapporteringstype } from "~/hooks/useRapporteringstype";
import { useSanity } from "~/hooks/useSanity";

export function RapporteringstypeForm({
  type,
  setType,
  rapporteringsperiodeId,
}: {
  type: Rapporteringstype | undefined;
  setType: (value: Rapporteringstype) => void;
  rapporteringsperiodeId: string;
}) {
  const { getAppText } = useSanity();
  const fetcher = useFetcher();

  const changeHandler = (valgtType: Rapporteringstype) => {
    if (type === undefined) {
      fetcher.submit({ _action: "start", rapporteringsperiodeId }, { method: "post" });
    }

    setType(valgtType);
  };

  return (
    <div>
      <RadioGroup
        legend={getAppText("rapportering-ikke-utfylte-rapporter-tittel")}
        description={getAppText("rapportering-ikke-utfylte-rapporter-subtittel")}
        onChange={changeHandler}
        value={type}
      >
        <Radio value={Rapporteringstype.harAktivitet}>
          {getAppText("rapportering-noe-å-rapportere")}
        </Radio>
        <Radio value={Rapporteringstype.harIngenAktivitet}>
          {getAppText("rapportering-ingen-å-rapportere")}
        </Radio>
      </RadioGroup>
    </div>
  );
}
