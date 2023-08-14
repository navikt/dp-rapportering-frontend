interface IProps {
  dato: string;
  kort?: boolean;
  ukedag?: boolean;
  arr?: boolean;
}

export function FormattertDato(props: IProps) {
  const locale = "no-NO";

  let options: Intl.DateTimeFormatOptions = {
    month: props.kort ? "2-digit" : "long",
    day: props.kort ? "2-digit" : "numeric",
  };

  if (props.ukedag) {
    options.weekday = "long";
  }

  if (props.arr) {
    options.year = "numeric";
  }

  const formattertDato = new Date(props.dato).toLocaleDateString(locale, options);

  return <>{formattertDato}</>;
}
