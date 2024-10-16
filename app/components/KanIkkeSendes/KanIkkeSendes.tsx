import { Alert } from "@navikt/ds-react";
import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { IRapporteringsperiodeStatus } from "~/utils/types";
import { useSanity } from "~/hooks/useSanity";

interface IProps {
  periode: IRapporteringsperiode;
}

export function KanIkkeSendes(props: IProps): JSX.Element | undefined {
  const { getAppText } = useSanity();

  if (
    props.periode.status !== IRapporteringsperiodeStatus.TilUtfylling &&
    !props.periode.kanSendes
  ) {
    return (
      <Alert variant="warning" className="my-4">
        {getAppText("rapportering-periode-kan-ikke-sendes")}
      </Alert>
    );
  }

  return undefined;
}
