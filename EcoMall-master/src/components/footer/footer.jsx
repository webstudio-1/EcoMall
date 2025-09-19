import React from "react";
import styles from "./footer.module.css";
import footer_logo from "../../assets/images/footer_logo.png";
import payment_logo from "../../assets/images/payment_logo.png";

import {
  FaFacebookF,
  FaTwitter,
  FaYoutube,
  FaInstagram,
  FaWhatsapp,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className="container py-4">
        <div className="row text-start">
          {/* Our Signature */}
          <div className="col-md-2 mb-4">
            <h6 className="fw-bold">OUR SIGNATURE</h6>
            <img
              src={footer_logo}
              alt="EcoMall Signature"
              style={{ width: "120px", marginTop: "10px" }}
            />
          </div>

          {/* Vendor Registration */}
          <div className="col-md-2 mb-4">
            <h6 className="fw-bold">VENDOR REGISTRATION</h6>
            <p className="text-muted">Fill the form to register as Vendor</p>
          </div>

          {/* Ecomall Links */}
          <div className="col-md-2 mb-4">
            <h6 className="fw-bold">ECOMALL</h6>
            <ul className={styles.footerLinks}>
              <li>Why ecomall</li>
              <li>Join ecomall</li>
              <li>Discrimination Policy</li>
              <li>Privacy Policy</li>
              
            </ul>
          </div>

             <div className="col-md-2 mt-4">
            <ul className={styles.footerLinks}>
              <li>Shipping Policy</li>
              <li>Returns Policy</li>
              <li>Terms of Use</li>
              <li>
                <strong>iCapCarbon. Do You? (Blog)</strong>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-md-2 mb-4">
            <h6 className="fw-bold">CONTACT INFO</h6>
            <p>
              <strong>Address:</strong> Hyderabad, Telangana
            </p>
            <p>
              <strong>Phone:</strong> +91 9701010176
            </p>
            <p>
              <strong>Email:</strong> help@ecomall.xyz
            </p>

            <h6 className="fw-bold mt-3">FOLLOW ECOMALL</h6>
            <div className={styles.socialIcons}>
              <a href="#"><FaFacebookF /></a>
              <a href="#"><FaTwitter /></a>
              <a href="#"><FaYoutube /></a>
              <a href="#"><FaInstagram /></a>
              <a href="#"><FaWhatsapp /></a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center mt-3 text-muted small ">
          &copy; Copyright 2025. All Rights Reserved. 
          {/* Payment gateway images - using available payment images */}
          <div className="mt-2">
            <img src={payment_logo} alt="Payment Methods" style={{maxHeight: "30px", margin: "0 5px"}} />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
