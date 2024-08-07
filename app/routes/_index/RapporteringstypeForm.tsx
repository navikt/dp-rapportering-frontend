import { Radio, RadioGroup } from "@navikt/ds-react";
import { PortableText } from "@portabletext/react";
import { useFetcher } from "@remix-run/react";
import { Rapporteringstype } from "~/utils/types";
import { useSanity } from "~/hooks/useSanity";

interface RapporteringstypeFormProps {
  label: string;
  description: string;
  rapporteringstype: Rapporteringstype | undefined;
  rapporteringsperiodeId: string;
}

export function RapporteringstypeForm({
  label,
  description,
  rapporteringstype,
  rapporteringsperiodeId,
}: RapporteringstypeFormProps) {
  const { getAppText, getRichText } = useSanity();
  const fetcher = useFetcher();

  const handleChange = (valgtType: Rapporteringstype) => {
    if (rapporteringstype === undefined) {
      fetcher.submit({ rapporteringsperiodeId }, { method: "post", action: "api/start" });
    }

    fetcher.submit({ rapporteringstype: valgtType }, { method: "post" });
  };

  return (
    <RadioGroup
      legend={label}
      description={description}
      onChange={handleChange}
      value={rapporteringstype || ""}
    >
      <Radio value={Rapporteringstype.harAktivitet}>
        {getAppText("rapportering-noe-å-rapportere")}
      </Radio>
      <Radio
        data-testid="rapportering-ingen-å-rapportere"
        className="rapportering-ingen-å-rapportere"
        value={Rapporteringstype.harIngenAktivitet}
      >
        <PortableText value={getRichText("rapportering-ingen-å-rapportere")} />
      </Radio>
    </RadioGroup>
  );
}
