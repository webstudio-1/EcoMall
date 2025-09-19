import React from "react";
import styles from "./ecoFriendlyProducts.module.css";
import { FaRecycle, FaLeaf, FaTshirt, FaShoppingCart } from "react-icons/fa";

const EcoFriendlyProducts = () => {
  const products = [
    {
      id: 1,
      name: "Organic Cotton T-Shirt",
      price: 29.99,
      image: "/images/organic-tshirt.jpg",
      category: "Clothing"
    },
    {
      id: 2,
      name: "Bamboo Toothbrush Set",
      price: 12.99,
      image: "/images/bamboo-toothbrush.jpg",
      category: "Personal Care"
    },
    {
      id: 3,
      name: "Reusable Grocery Bag",
      price: 9.99,
      image: "/images/grocery-bag.jpg",
      category: "Accessories"
    },
    {
      id: 4,
      name: "Stainless Steel Water Bottle",
      price: 24.99,
      image: "/images/water-bottle.jpg",
      category: "Drinkware"
    }
  ];

  return (
    <div className={styles.ecoProductsPage}>
      {/* Hero Section */}
      <div className={styles.heroBanner}>
        <div className={styles.heroContent}>
          <h1>Eco-Friendly Products</h1>
          <p>Sustainable choices for a better tomorrow</p>
        </div>
      </div>

      {/* Categories Section */}
      <div className={styles.categoriesSection}>
        <h2 style={{ color: "#46c919" , fontSize: "2rem" , fontWeight: "bold" , textAlign: "center" }}>Shop by Category</h2>
        <div className={styles.categoryGrid}>
          {['Clothing', 'Personal Care', 'Home', 'Kitchen', 'All Products'].map((category) => (
            <div key={category} className={styles.categoryCard}>
              <div className={styles.categoryIcon}>
                <FaLeaf />
              </div>
              <h3>{category}</h3>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div className={styles.productsSection}>
        <h2 style={{ color: "#46c919" , fontSize: "2rem" , fontWeight: "bold" , textAlign: "center" }}>Featured Products</h2>
        <div className={styles.productsGrid}>
          {products.map((product) => (
            <div key={product.id} className={styles.productCard}>
              <div className={styles.productImage}>
                <img src={product.image} alt={product.name} />
                <div className={styles.productOverlay}>
                  <button className={styles.addToCartBtn}>
                    <FaShoppingCart /> Add to Cart
                  </button>
                </div>
              </div>
              <div className={styles.productInfo}>
                <h3>{product.name}</h3>
                <p className={styles.productCategory}>{product.category}</p>
                <p className={styles.productPrice}>${product.price.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter Section */}
      <div className={styles.newsletterSection}>
        <div className={styles.newsletterContent}>
          <h2>Join Our Eco Community</h2>
          <p>Subscribe to get updates on new sustainable products and eco tips</p>
          <div className={styles.newsletterForm}>
            <input type="email" placeholder="Enter your email" />
            <button>Subscribe</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EcoFriendlyProducts;