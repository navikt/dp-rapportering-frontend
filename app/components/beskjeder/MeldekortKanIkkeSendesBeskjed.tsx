import { XMarkOctagonIcon } from "@navikt/aksel-icons";
import { InfoCard } from "@navikt/ds-react";
import { JSX } from "react";

import { useSanity } from "~/hooks/useSanity";
import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { kanSendes } from "~/utils/periode.utils";

interface IProps {
  periode: IRapporteringsperiode;
}

export function MeldekortKanIkkeSendesBeskjed(props: IProps): JSX.Element | undefined {
  const { getAppText } = useSanity();

  if (!kanSendes(props.periode)) {
    return (
      <InfoCard data-color="danger" role="alert" className="my-4">
        <InfoCard.Message icon={<XMarkOctagonIcon aria-hidden />}>
          {getAppText("rapportering-periode-kan-ikke-sendes")}
        </InfoCard.Message>
      </InfoCard>
    );
  }

  return undefined;
}
