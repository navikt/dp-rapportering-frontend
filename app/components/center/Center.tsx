import styles from "./Center.module.css";
import React from "react";

interface ICenterProps {
  children: React.ReactNode;
}

const Center: React.FC<ICenterProps> = ({ children }) => {
  return <div className={styles.center}>{children}</div>;
};

export default Center;
