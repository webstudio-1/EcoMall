// src/aggregate/ecoFriendlyServices/ecoFriendlyServices.jsx
import React from 'react';
import { FaRecycle, FaLeaf, FaSeedling, FaSolarPanel, FaWater, FaTree } from 'react-icons/fa';
import styles from './ecoFriendlyServices.module.css';

const EcoFriendlyServices = () => {
  const services = [
    {
      id: 1,
      title: "Waste Management",
      description: "Comprehensive recycling and waste reduction solutions for homes and businesses.",
      icon: <FaRecycle className={styles.serviceIcon} />,
      color: "#4CAF50"
    },
    {
      id: 2,
      title: "Organic Farming",
      description: "Sustainable farming practices and consultation services for organic agriculture.",
      icon: <FaLeaf className={styles.serviceIcon} />,
      color: "#8BC34A"
    },
    {
      id: 3,
      title: "Renewable Energy",
      description: "Solar panel installation and renewable energy solutions for sustainable power.",
      icon: <FaSolarPanel className={styles.serviceIcon} />,
      color: "#FFC107"
    },
    {
      id: 4,
      title: "Water Conservation",
      description: "Water-saving solutions and sustainable water management systems.",
      icon: <FaWater className={styles.serviceIcon} />,
      color: "#2196F3"
    },
    {
      id: 5,
      title: "Eco-Consulting",
      description: "Expert advice on implementing sustainable practices in your home or business.",
      icon: <FaTree className={styles.serviceIcon} />,
      color: "#009688"
    },
    {
      id: 6,
      title: "Sustainable Landscaping",
      description: "Eco-friendly garden and landscape design using native plants.",
      icon: <FaSeedling className={styles.serviceIcon} />,
      color: "#795548"
    }
  ];

  return (
    <div className={styles.servicesPage}>
      <div className={styles.heroSection}>
        <h1>Eco-Friendly Services</h1>
        <p>Sustainable solutions for a greener tomorrow</p>
      </div>

      <div className={styles.servicesContainer}>
        <h2>Our Services</h2>
        <div className={styles.servicesGrid}>
          {services.map((service) => (
            <div 
              key={service.id} 
              className={styles.serviceCard}
              style={{ '--service-color': service.color }}
            >
              <div className={styles.iconContainer}>
                {service.icon}
              </div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <button className={styles.learnMoreBtn}>Learn More</button>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.ctaSection}>
        <h2>Ready to Go Green?</h2>
        <p>Contact us today to learn how we can help you implement sustainable solutions.</p>
        <button className={styles.contactBtn}>Contact Us</button>
      </div>
    </div>
  );
};

export default EcoFriendlyServices;