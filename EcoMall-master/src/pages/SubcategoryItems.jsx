import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getJson } from "../services/api";
import { useCartWishlist } from "../context/CartWishlistContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { FaHeart, FaRegEye } from "react-icons/fa";

const SubcategoryItems = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToWishlist, addToCart } = useCartWishlist();
  const { showToast } = useToast();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null); // For modal

  // Parse subcategoryId safely
  const subcategoryId = useMemo(() => {
    const parsed = parseInt(id, 10);
    return isNaN(parsed) ? 0 : parsed;
  }, [id]);

  // Fetch items
  useEffect(() => {
    if (!subcategoryId) {
      setError("Invalid subcategory ID");
      setLoading(false);
      return;
    }

    let isCancelled = false;

    const fetchItems = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getJson(`/EcoMall/menu/subcategories/${subcategoryId}/items/`);

        if (!isCancelled) {
          if (Array.isArray(data)) {
            setItems(data);
          } else {
            throw new Error("Unexpected response format");
          }
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err.message || "Failed to load items. Please try again later.");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchItems();

    return () => {
      isCancelled = true;
    };
  }, [subcategoryId]);

  // Handle View Details → Open Modal
  const handleView = (item) => {
    setSelectedItem(item);
  };

  // Close Modal
  const handleCloseModal = () => {
    setSelectedItem(null);
  };

  // Add to Cart (card and modal)
  const handleAddToCart = async (item) => {
    const safeId = Number(item?.item_id || item?.id);
    if (!safeId || Number.isNaN(safeId)) {
      showToast?.('Item id not available', 'error');
      return;
    }
    try {
      await addToCart({ id: safeId, title: item?.item_name || item?.title, image: item?.image, selling_price: item?.selling_price }, 1);
      showToast?.('Added to cart', 'success');
    } catch (e) {
      showToast?.(e?.message || 'Failed to add to cart', 'error');
    }
  };

  // Safe wishlist handler
  const handleAddToWishlist = async (item) => {
    const safeId = Number(item?.item_id || item?.id);
    if (!safeId || Number.isNaN(safeId)) {
      showToast?.('Item id not available', 'error');
      return;
    }
    try {
      await addToWishlist({ id: safeId, title: item?.item_name || item?.title, image: item?.image, selling_price: item?.selling_price });
      showToast?.('Added to wishlist', 'success');
    } catch (e) {
      showToast?.(e?.message || 'Failed to add to wishlist', 'error');
    }
  };

  // Safe image fallback
  const handleImageError = (e) => {
    e.target.src = "/images/placeholder.png";
    e.target.alt = "Image unavailable";
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          ← Back
        </button>
        <h1 className="h4 mb-0">Products</h1>
        <div style={{ width: "80px" }} />
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-2 text-muted">Loading products...</p>
        </div>
      )}
      {/* Hover styles for image actions */}
      <style>{`
        .sc-image-wrapper { position: relative; }
        .sc-hover-actions {
          position: absolute;
          top: 12px;
          right: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          opacity: 0;
          transform: translateX(10px);
          transition: all 0.3s ease;
        }
        .sc-image-wrapper:hover .sc-hover-actions {
          opacity: 1;
          transform: translateX(0);
        }
        .sc-action-btn {
          width: 40px;
          height: 40px;
          border: none;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
          color: #666;
          padding: 0;
        }
        .sc-action-btn:hover {
          background: #46c919;
          color: #fff;
          transform: scale(1.1);
          box-shadow: 0 4px 16px rgba(70, 201, 25, 0.3);
        }
      `}</style>

      {/* Error */}
      {error && (
        <div className="alert alert-danger d-flex align-items-center">
          <span className="me-2">⚠️</span>
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && (!items || items.length === 0) && (
        <div className="text-center py-5 text-muted">
          <div className="display-6">📭</div>
          <p>No products found.</p>
        </div>
      )}

      {/* Products Grid */}
      {!loading && !error && items && items.length > 0 && (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
          {items.map((item) => {
            const itemId = item?.item_id || "";
            const itemName = item?.item_name || "Unnamed Product";
            const itemPrice = item?.selling_price != null ? Number(item.selling_price) : null;
            const itemImage = item?.image || "";
            const isItemNew = item?.is_new || false;

            return (
              <div key={itemId || Math.random()} className="col">
                <div className="card border-0 shadow-sm h-100 bg-white rounded-4 overflow-hidden">
                  {/* Image Section */}
                  <div className="position-relative sc-image-wrapper">
                    {isItemNew && (
                      <span className="badge bg-success position-absolute top-0 start-0 m-2 fs-7 fw-bold">
                        NEW
                      </span>
                    )}
                    {itemImage ? (
                      <img
                        src={itemImage}
                        alt={itemName}
                        className="img-fluid w-100"
                        style={{ height: "200px", objectFit: "cover" }}
                        loading="lazy"
                        onError={handleImageError}
                      />
                    ) : (
                      <div
                        className="bg-light d-flex align-items-center justify-content-center"
                        style={{ height: "200px" }}
                      >
                        <span className="text-muted">No Image</span>
                      </div>
                    )}
                    <div className="sc-hover-actions">
                      <button
                        className="sc-action-btn"
                        aria-label="Add to wishlist"
                        onClick={() => handleAddToWishlist(item)}
                        title="Add to wishlist"
                      >
                        <FaHeart />
                      </button>
                      <button
                        className="sc-action-btn"
                        aria-label="Quick view"
                        onClick={() => handleView(item)}
                        title="Quick view"
                      >
                        <FaRegEye />
                      </button>
                    </div>
                  </div>

                  <div className="p-3">
                    <h6 className="mb-2 text-truncate" title={itemName}>
                      {itemName}
                    </h6>
                    {itemPrice != null && (
                      <p className="mb-3 text-success fw-bold" >
                        <span style={{ fontSize: "1.5rem", color: "#46c919" }}>₹{itemPrice.toLocaleString("en-IN")}</span>
                      </p>
                    )}
                    <button
                      className="w-100 btn btn-success rounded-pill py-2 fw-semibold"
                      style={{ backgroundColor: "#46c919", border: "none" }}
                      onClick={() => handleAddToCart(item)}
                    >
                      ADD TO CART
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL POPUP */}
      {selectedItem && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          tabIndex="-1"
          role="dialog"
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content rounded-4 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <button
                  type="button"
                  className="btn-close float-end"
                  aria-label="Close"
                  onClick={handleCloseModal}
                ></button>
              </div>
              <div className="modal-body p-4">
                <div className="row align-items-center">
                  <div className="col-md-6">
                    <img
                      src={selectedItem.image || "/images/placeholder.png"}
                      alt={selectedItem.item_name}
                      className="img-fluid rounded-4"
                      style={{ maxHeight: "400px", objectFit: "contain" }}
                      onError={handleImageError}
                    />
                  </div>
                  <div className="col-md-6">
                    <h4 className="mb-2">{selectedItem.item_name}</h4>
                    <p className="text-success fw-bold mb-3" >
                      <span style={{ fontSize: "1.5rem", color: "#46c919" }}>₹{Number(selectedItem.selling_price).toLocaleString("en-IN")}</span>
                    </p>
                    <p className="text-muted mb-4">Inclusive of all taxes</p>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-success px-4 py-2 fw-semibold"
                        style={{ backgroundColor: "#46c919", border: "none" }}
                        onClick={() => handleAddToCart(selectedItem)}
                      >
                        ADD TO CART
                      </button>
                      <button
                        className="btn btn-outline-secondary px-4 py-2"
                        onClick={handleCloseModal}
                      >
                        CLOSE
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubcategoryItems;