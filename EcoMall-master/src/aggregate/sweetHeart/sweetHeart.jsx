// src/aggregate/sweetHeart/sweetHeart.jsx
import React from 'react';
import styles from './sweetHeart.module.css';
import { FaHeart, FaGift, FaShoppingCart } from 'react-icons/fa';

const SweetHeart = () => {
  const products = [
    {
      id: 1,
      name: "Handmade Heart Necklace",
      price: 49.99,
      originalPrice: 69.99,
      image: "/images/heart-necklace.jpg",
      rating: 4.8,
      reviews: 124
    },
    {
      id: 2,
      name: "Personalized Love Mug",
      price: 19.99,
      originalPrice: 24.99,
      image: "/images/love-mug.jpg",
      rating: 4.5,
      reviews: 89
    },
    {
      id: 3,
      name: "Romantic Candle Set",
      price: 34.99,
      image: "/images/romantic-candles.jpg",
      rating: 4.7,
      reviews: 156
    },
    {
      id: 4,
      name: "Love Letter Set",
      price: 22.99,
      originalPrice: 29.99,
      image: "/images/love-letters.jpg",
      rating: 4.6,
      reviews: 67
    }
  ];

  return (
    <div className={styles.sweetHeartPage}>
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1>Sweet Heart Collection</h1>
          <p>Express your love with our handpicked collection of romantic gifts</p>
        </div>
      </div>

      <div className={styles.productsSection}>
        <h2>Featured Gifts</h2>
        <div className={styles.productsGrid}>
          {products.map((product) => (
            <div key={product.id} className={styles.productCard}>
              <div className={styles.productImage}>
                <img src={product.image} alt={product.name} />
                <div className={styles.discountBadge}>
                  {product.originalPrice && (
                    <span>Save ${(product.originalPrice - product.price).toFixed(2)}</span>
                  )}
                </div>
                <button className={styles.addToCartBtn}>
                  <FaShoppingCart /> Add to Cart
                </button>
              </div>
              <div className={styles.productInfo}>
                <h3>{product.name}</h3>
                <div className={styles.priceContainer}>
                  <span className={styles.price}>${product.price.toFixed(2)}</span>
                  {product.originalPrice && (
                    <span className={styles.originalPrice}>${product.originalPrice.toFixed(2)}</span>
                  )}
                </div>
                <div className={styles.rating}>
                  <div className={styles.stars}>
                    {[...Array(5)].map((_, i) => (
                      <FaHeart 
                        key={i} 
                        className={i < Math.floor(product.rating) ? styles.filled : styles.empty}
                      />
                    ))}
                  </div>
                  <span className={styles.reviewCount}>({product.reviews})</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <FaGift className={styles.giftIcon} />
          <h2>Need Help Choosing?</h2>
          <p>Our gift experts are here to help you find the perfect romantic gift</p>
          <button className={styles.contactBtn}>Contact Us</button>
        </div>
      </div>
    </div>
  );
};

export default SweetHeart;