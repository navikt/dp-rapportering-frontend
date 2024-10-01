import styles from "./Center.module.css";
import classNames from "classnames";
import React from "react";

interface ICenterProps {
  children: React.ReactNode;
  className?: string;
}

const Center: React.FC<ICenterProps> = ({ children, className }) => {
  return <div className={classNames(styles.center, className)}>{children}</div>;
};

export default Center;
