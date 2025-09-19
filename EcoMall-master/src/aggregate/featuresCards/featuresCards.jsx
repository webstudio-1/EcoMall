import React from "react";
import styles from "./featuresCards.module.css";
import { FaHeadphones, FaCreditCard, FaWrench } from "react-icons/fa";

const FeatureCards = () => {
  return (
    <section className="feature-section py-5 bg-light">
      <div className="container">
        <div className="row justify-content-center text-center">
          {/* Card 1 */}
          <div className="col-md-4 mb-4">
            <div className="feature-card">
              <div className="icon-circle">
                <FaHeadphones size={32} />
              </div>
              <p className="feature-text">
                Fast customer service support via WhatsApp
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="col-md-4 mb-4">
            <div className="feature-card">
              <div className="icon-circle">
                <FaCreditCard size={32} />
              </div>
              <p className="feature-text">All payment gateways options offered</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="col-md-4 mb-4">
            <div className="feature-card">
              <div className="icon-circle">
                <FaWrench size={32} />
              </div>
              <p className="feature-text">Easy returns</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureCards;