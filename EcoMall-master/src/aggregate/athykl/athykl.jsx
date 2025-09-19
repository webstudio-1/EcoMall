import React from "react";
import styles from "./athykl.module.css";
import { FaRecycle, FaLeaf, FaTshirt } from "react-icons/fa";

const Athykl = () => {
  return (
    <section className={styles.athyklSection}>
      <div className="container">
        <div className={styles.athyklHeader}>
          <h2>SUSTAINABLE CLOTHING & ACCESSORIES</h2>
          <div className={styles.iconContainer}>
            <FaTshirt className={styles.icon} />
            <FaRecycle className={styles.icon} />
            <FaLeaf className={styles.icon} />
          </div>
        </div>
        
        <div className={styles.contentWrapper}>
          <div className={styles.textContent}>
            <p className={styles.paragraph}>
              We are buying cheap and glittery clothes mindlessly and use them once or twice and discard. 
              Then a new style comes in the market at a cheap price and we end up buying that. 
              After a couple of wears, we toss them. 
              <span className={styles.highlight}>We are sending 3 tons of garments to landfills EVERY SECOND.</span> 
              What a colossal waste of resources!
            </p>
            <p className={styles.paragraph}>
              You are on this page not only because you don't want to contribute to this wastage, 
              but also because you're looking for trendy and fashionable wear.
            </p>
            <p className={styles.paragraph}>
              This is what we are attempting to bring to the fore through our sustainable brand ATHYKL for clothing and accessories.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Athykl;