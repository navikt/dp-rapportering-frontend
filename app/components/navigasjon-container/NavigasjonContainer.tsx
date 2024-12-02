import styles from "./NavigasjonContainer.module.css";
import classNames from "classnames";

interface IProps {
  children: React.ReactNode;
  className?: string;
}

export function NavigasjonContainer(props: IProps): JSX.Element {
  const { children, className } = props;
  return <div className={classNames(styles.container, className)}>{children}</div>;
}
