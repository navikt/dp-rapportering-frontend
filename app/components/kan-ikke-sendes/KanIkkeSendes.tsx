import { Alert } from "@navikt/ds-react";
import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { kanSendes } from "~/utils/periode.utils";
import { useSanity } from "~/hooks/useSanity";

interface IProps {
  periode: IRapporteringsperiode;
}

export function KanIkkeSendes(props: IProps): JSX.Element | undefined {
  const { getAppText } = useSanity();

  if (!kanSendes(props.periode)) {
    return (
      <Alert variant="error" className="my-4">
        {getAppText("rapportering-periode-kan-ikke-sendes")}
      </Alert>
    );
  }

  return undefined;
}