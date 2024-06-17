import styles from "./Center.module.css";
import React from "react";

interface CenterProps {
  children: React.ReactNode;
}

const Center: React.FC<CenterProps> = ({ children }) => {
  return <div className={styles.center}>{children}</div>;
};

export default Center;
