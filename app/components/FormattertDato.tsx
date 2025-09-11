import { TZDate } from "@date-fns/tz";

import { DecoratorLocale } from "~/utils/dekoratoren.utils";
import { TIDSSONER } from "~/utils/types";

interface IProps {
  dato: string;
  kort?: boolean;
  ukedag?: boolean;
  arr?: boolean;
  locale: DecoratorLocale;
}

export function FormattertDato(props: IProps) {
  const locale = props.locale ?? DecoratorLocale.NB;

  const options: Intl.DateTimeFormatOptions = {
    month: props.kort ? "2-digit" : "long",
    day: props.kort ? "2-digit" : "numeric",
  };

  if (props.ukedag) {
    options.weekday = "long";
  }

  if (props.arr) {
    options.year = "numeric";
  }

  const formattertDato = new TZDate(props.dato, TIDSSONER.OSLO).toLocaleDateString(locale, options);

  return <>{formattertDato}</>;
}
