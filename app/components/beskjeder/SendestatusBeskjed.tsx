import { ExclamationmarkTriangleIcon, XMarkOctagonIcon } from "@navikt/aksel-icons";
import { InfoCard } from "@navikt/ds-react";
import { JSX } from "react";

import { PortableTextRenderer } from "~/components/portable-text/PortableTextRenderer";
import { useSanity } from "~/hooks/useSanity";
import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { kanSendes } from "~/utils/periode.utils";

interface IProps {
  periode: IRapporteringsperiode;
  textKey?: string;
}

export function SendestatusBeskjed({ periode, textKey }: IProps): JSX.Element {
  const { getAppText, getRichText } = useSanity();

  if (kanSendes(periode)) {
    return (
      <InfoCard data-color="warning" className="my-4">
        <InfoCard.Header icon={<ExclamationmarkTriangleIcon aria-hidden />}>
          <InfoCard.Title>
            <PortableTextRenderer
              value={getRichText(textKey ?? "rapportering-meldekort-ikke-sendt-enda")}
            />
          </InfoCard.Title>
        </InfoCard.Header>
      </InfoCard>
    );
  }

  return (
    <InfoCard data-color="danger" role="alert" className="my-4">
      <InfoCard.Message icon={<XMarkOctagonIcon aria-hidden />}>
        {getAppText("rapportering-periode-kan-ikke-sendes")}
      </InfoCard.Message>
    </InfoCard>
  );
}
