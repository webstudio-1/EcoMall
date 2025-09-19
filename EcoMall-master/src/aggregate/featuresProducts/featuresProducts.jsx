import React, { useState, useEffect } from "react";
import styles from "./featuresProducts.module.css"; // Updated styling below
import { getJson } from "../../services/api";
import { useCartWishlist } from "../../context/CartWishlistContext.jsx";
import { FaHeart, FaRegEye, FaTimes } from "react-icons/fa";

// Utility to map item from API to UI card model
function mapItemToCard(item) {
  return {
    id: item.item_id,
    title: item.item_name || "Unknown Product",
    price: item.selling_price != null ? `₹${Number(item.selling_price).toFixed(2)}` : '₹0.00',
    image: item.image
      ? item.image.startsWith('http')
        ? item.image
        : `https://yourdomain.com/${item.image}`
      : '/default-product.jpg', // 👈 SET YOUR FALLBACK IMAGE PATH HERE
    link: '#',
  };
}

const WorkingCarousel = ({ products, sectionTitle }) => {
  const { addToCart, addToWishlist } = useCartWishlist();
  const [quickView, setQuickView] = useState(null); // product to preview
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(4);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 576) setItemsPerPage(1);
      else if (width < 768) setItemsPerPage(2);
      else if (width < 992) setItemsPerPage(3);
      else setItemsPerPage(4);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalPages = Math.ceil(Math.max(products.length, 1) / Math.max(itemsPerPage, 1));

  const nextPage = () => {
    if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
  };
  const prevPage = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };
  const goToPage = (pageIndex) => setCurrentPage(pageIndex);

  // Translate track one full viewport per page
  const translatePercent = -(currentPage * 100);

  return (
    <section className={styles.carouselContainer}>
      <h3 className="mb-4 text-center fw-bold">{sectionTitle}</h3>
      <div className={styles.carouselWrapper}>
        {totalPages > 1 && (
          <button
            className={`${styles.carouselBtn} ${styles.prevBtn}`}
            onClick={prevPage}
            disabled={currentPage === 0}
            aria-label="Previous"
          >
            ‹
          </button>
        )}

        <div className={styles.carouselContent}>
          <div
            className={styles.carouselTrack}
            style={{ transform: `translateX(${translatePercent}%)` }}
          >
            {products.map((p) => (
              <div key={p.id} className={styles.carouselItem}>
                <div className={`${styles.productCard} card border-0`}>
                  <div className={styles.cardImageWrapper}>
                    <div className={styles.imageContainer}>
                      <a href={p.link} className="text-decoration-none">
                        <img
                          src={p.image}
                          alt={p.title}
                          className={styles.productImage}
                          loading="lazy"
                          onError={(e) => {
                            e.target.src = '/default-product.jpg'; // 👈 FALLBACK
                            e.target.onerror = null;
                          }}
                        />
                      </a>
                      <div className={styles.cardBadge}>
                        <span className={styles.badge}>New</span>
                      </div>
                      <div className={styles.hoverActions}>
                        <button
                          className={styles.actionBtn}
                          title="Add to wishlist"
                          onClick={() => addToWishlist(p)}
                        >
                          <FaHeart />
                        </button>
                        <button
                          className={styles.actionBtn}
                          title="Quick view"
                          onClick={() => setQuickView(p)}
                        >
                          <FaRegEye />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className={styles.cardContent}>
                    <div className={styles.productInfo}>
                      <h4 className={styles.productTitle}>{p.title}</h4>
                      <div className={styles.priceSection}>
                        <span className={styles.currentPrice}>{p.price}</span>
                      </div>
                    </div>

                    <div className={styles.cardActions}>
                      <button
                        className={styles.addToCartBtn}
                        onClick={() => addToCart(p)}
                      >
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {totalPages > 1 && (
          <button
            className={`${styles.carouselBtn} ${styles.nextBtn}`}
            onClick={nextPage}
            disabled={currentPage >= totalPages - 1}
            aria-label="Next"
          >
            ›
          </button>
        )}
      </div>

      {totalPages > 1 && (
        <div className={styles.carouselIndicators}>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`${styles.indicator} ${currentPage === i ? styles.active : ''}`}
              onClick={() => goToPage(i)}
              aria-label={`Go to page ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Quick View Modal */}
      {quickView && (
        <div className={styles.modalBackdrop} onClick={() => setQuickView(null)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className="d-flex align-items-center justify-content-between w-100">
                <div></div>
                <button
                  type="button"
                  aria-label="Close"
                  className="btn btn-sm btn-light"
                  onClick={() => setQuickView(null)}
                  style={{ borderRadius: '999px' }}
                >
                  <FaTimes />
                </button>
              </div>
            </div>
            <div className={styles.modalBody}>
              <div className="row g-3">
                <div className="col-md-6 text-center">
                  <img
                    src={quickView.image}
                    alt={quickView.title}
                    className="img-fluid"
                    style={{ maxHeight: 320, objectFit: 'cover', borderRadius: '8px' }}
                    onError={(e) => {
                      e.target.src = '/default-product.jpg';
                      e.target.onerror = null;
                    }}
                  />
                </div>
                <div className="col-md-6">
                  <div className="fw-semibold mb-2" style={{ color: '#1f1f1f' }}>
                    {quickView.title}
                  </div>
                  <div className="fs-4 mb-2" style={{ color: '#166d4a' }}>
                    {quickView.price}
                  </div>
                  <div className="mb-3 text-muted">Inclusive of all taxes</div>
                  <div className="d-flex gap-2 mb-3">
                    <button
                      className="btn"
                      style={{
                        backgroundColor: '#46c919',
                        color: '#ffffff',
                        border: '1px solid #46c919',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#3ab015';
                        e.currentTarget.style.borderColor = '#3ab015';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#46c919';
                        e.currentTarget.style.borderColor = '#46c919';
                      }}
                      onClick={() => {
                        addToCart(quickView);
                        setQuickView(null);
                      }}
                    >
                      ADD TO CART
                    </button>
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => setQuickView(null)}
                    >
                      CLOSE
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

const FeaturedProducts = () => {
  const [bestSale, setBestSale] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError('');
        const [best, newer, trend] = await Promise.all([
          getJson('/EcoMall/items/best-sale/'),
          getJson('/EcoMall/items/new-arrivals/'),
          getJson('/EcoMall/items/trending/'),
        ]);
        if (!cancelled) {
          setBestSale((best || []).map(mapItemToCard));
          setNewArrivals((newer || []).map(mapItemToCard));
          setTrending((trend || []).map(mapItemToCard));
        }
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load products');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="container my-5">
      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? (
        <div className="text-center py-5">Loading...</div>
      ) : (
        <>
          <div className={styles.sectionSpacer}>
            <WorkingCarousel products={bestSale} sectionTitle="Best Sellers" />
          </div>
          <div className={styles.sectionSpacer}>
            <WorkingCarousel products={newArrivals} sectionTitle="New Arrivals" />
          </div>
          <div className={styles.sectionSpacer}>
            <WorkingCarousel products={trending} sectionTitle="Popular Combos" />
          </div>
        </>
      )}
    </div>
  );
};

export default FeaturedProducts;