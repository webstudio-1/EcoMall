import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Import Bootstrap 5 CSS and JS
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Custom styles for enhanced appearance
const customStyles = `
  .product-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: none !important;
    box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  }
  .product-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 24px rgba(0,0,0,0.15);
  }
  .product-image {
    transition: transform 0.3s ease;
    border-radius: 12px;
  }
  .product-card:hover .product-image {
    transform: scale(1.05);
  }
  .btn-cart {
    background: linear-gradient(135deg, #28a745, #20c997);
    border: none;
    transition: all 0.3s ease;
  }
  .btn-cart:hover {
    background: linear-gradient(135deg, #218838, #1ea085);
    transform: translateY(-2px);
  }
  .price-tag {
    background: linear-gradient(135deg, #ff6b6b, #ee5a52);
    color: white;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
  }
  .discount-badge {
    background: linear-gradient(135deg, #ffd93d, #ff9f43);
    color: #333;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
  }
  .category-header {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    padding: 2rem;
    border-radius: 15px;
    margin-bottom: 2rem;
  }
  .btn-add-to-cart {
    background-color: #46c919 !important; /* Requested green */
    color: #ffffff !important;
    border: 1px solid #46c919 !important;
    border-radius: 4px !important;
    padding: 0.5rem 1rem !important;
    font-size: 0.875rem !important;
    font-weight: 500 !important;
    text-transform: uppercase;
    display: inline-flex !important;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    width: 100%;
    max-width: 200px;
    margin: 0 auto;
  }
  
  .btn-add-to-cart:hover {
    background-color: #3ab015 !important; /* Slightly darker on hover */
    border-color: #3ab015 !important;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  }
  
  .btn-add-to-cart:active {
    transform: translateY(0);
    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  }
  @media (max-width: 576px) {
    .product-card {
      margin-bottom: 1rem;
    }
    .category-header {
      padding: 1.5rem;
      text-align: center;
    }
  }
  /* Modal Buttons */
  .modal .btn-add-to-cart {
    padding: 0.5rem 5.5rem !important;
    font-size: 1rem !important;
    font-weight: 600 !important;
    white-space: nowrap; /* Keep text in one line */
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  
  .modal .btn-wishlist {
    width: 40px;
    height: 40px;
    padding: 0.25rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background-color: #fff0f0; /* Light red background */
    border: 1px solid #ff6b6b; /* Red border */
    color: #ff6b6b; /* Red icon */
  }
  
  .modal .btn-share {
    width: 40px;
    height: 40px;
    padding: 0.25rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background-color: #f0f7ff; /* Light blue background */
    border: 1px solid #4dabf7; /* Blue border */
    color: #228be6; /* Blue icon */
  }
  
  .btn-wishlist:hover, .btn-share:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
  /* Product Card Buttons */
  .product-card .card-buttons {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 2;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  
  .btn-wishlist, .btn-share {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: 1px solid #dee2e6;
    background-color: white;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  }
  
  .btn-wishlist {
    color: #ff6b6b;
  }
  
  .btn-share {
    color: #4dabf7;
  }
  
  .btn-wishlist:hover, .btn-share:hover {
    transform: scale(1.1);
  }
`;

const ImageZoom = ({ src, alt, zoomLevel = 2.5, width = '100%', height = '400px', children }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [lensPosition, setLensPosition] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const containerRef = React.createRef(null);
  const imgRef = React.createRef(null);

  const handleMouseMove = (e) => {
    if (!containerRef.current || !imgRef.current) return;
    
    const container = containerRef.current.getBoundingClientRect();
    const img = imgRef.current.getBoundingClientRect();
    
    let x = e.clientX - container.left;
    let y = e.clientY - container.top;
    
    const lensWidth = 150;
    const lensHeight = 150;
    
    x = Math.max(lensWidth / 2, Math.min(x, container.width - lensWidth / 2));
    y = Math.max(lensHeight / 2, Math.min(y, container.height - lensHeight / 2));
    
    const bgX = (x / container.width) * (img.width * zoomLevel - container.width);
    const bgY = (y / container.height) * (img.height * zoomLevel - container.height);
    
    setLensPosition({
      x: x - lensWidth / 2,
      y: y - lensHeight / 2,
      bgX: -bgX,
      bgY: -bgY
    });
  };

  const handleImageLoad = (e) => {
    setImageSize({
      width: e.target.naturalWidth,
      height: e.target.naturalHeight
    });
  };

  return (
    <div className="row g-4">
      <div className="col-lg-6">
        <div 
          ref={containerRef}
          className="position-relative overflow-hidden"
          style={{
            height: '400px',
            backgroundColor: '#f8f9fa',
            cursor: isHovered ? 'none' : 'default',
            border: '1px solid #eee',
            borderRadius: '8px'
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onMouseMove={handleMouseMove}
        >
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            className="img-fluid"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              userSelect: 'none',
              pointerEvents: 'none'
            }}
            onLoad={handleImageLoad}
            draggable={false}
          />
          
          {isHovered && (
            <div 
              className="position-absolute border border-2 border-warning"
              style={{
                width: '150px',
                height: '150px',
                left: `${lensPosition.x}px`,
                top: `${lensPosition.y}px`,
                pointerEvents: 'none',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                zIndex: 10,
                borderRadius: '4px',
                overflow: 'hidden',
                boxShadow: '0 0 0 1px rgba(255,255,255,0.8), 0 0 10px rgba(0,0,0,0.2)'
              }}
            />
          )}
        </div>
        
        {/* Thumbnail images */}
        <div className="row g-2 mt-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="col-3">
              <div className="border rounded p-1" style={{ 
                cursor: 'pointer',
                border: '1px solid #dee2e6 !important',
                transition: 'all 0.2s ease'
              }}>
                <img 
                  src={src} 
                  alt={`${alt} view ${i}`}
                  className="img-fluid"
                  style={{ 
                    height: '70px', 
                    width: '100%',
                    objectFit: 'contain',
                    backgroundColor: '#f8f9fa'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Product Details and Zoom Preview */}
      <div className="col-lg-6">
        <div className="position-sticky" style={{ top: '20px' }}>
          {children}
          
          {/* Zoom Preview */}
          <div className="mt-4 border rounded p-3">
            <h6 className="mb-3">Zoom Preview</h6>
            <div 
              className="overflow-hidden"
              style={{
                height: '300px',
                backgroundColor: '#f8f9fa',
                border: '1px solid #eee',
                borderRadius: '4px',
                position: 'relative'
              }}
            >
              <div 
                className="w-100 h-100"
                style={{
                  backgroundImage: `url(${src})`,
                  backgroundSize: `${imageSize.width * zoomLevel}px ${imageSize.height * zoomLevel}px`,
                  backgroundPosition: isHovered ? `${lensPosition.bgX}px ${lensPosition.bgY}px` : 'center center',
                  backgroundRepeat: 'no-repeat',
                  transition: isHovered ? 'none' : 'background-position 0.1s ease',
                  backgroundColor: '#f8f9fa',
                  backgroundOrigin: 'border-box'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function HairCare() {
  const [sort, setSort] = useState("latest");
  const [hoveredCard, setHoveredCard] = useState(null);
  const [wishlist, setWishlist] = useState(new Set());
  const [cart, setCart] = useState([]);
  const [showQuickView, setShowQuickView] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [sortedProducts, setSortedProducts] = useState([]);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 12 });
  const [isScrollingDown, setIsScrollingDown] = useState(true);
  const [loading, setLoading] = useState(false);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const navigate = useNavigate();

  // Inject custom styles
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = customStyles;
    document.head.appendChild(styleElement);
    return () => document.head.removeChild(styleElement);
  }, []);

  // Initialize products and load first page
  useEffect(() => {
    const initialProducts = allProducts.slice(0, 12);
    setSortedProducts(allProducts);
    setVisibleRange({ start: 0, end: initialProducts.length });
    setHasMoreProducts(allProducts.length > initialProducts.length);
  }, []);

  // Sort products when sort option changes
  useEffect(() => {
    let sorted = [...allProducts];
    switch(sort) {
      case 'low':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'high':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      default: // latest
        sorted.sort((a, b) => b.id - a.id);
    }
    setSortedProducts(sorted);
    
    // Reset displayed products when sorting changes
    setVisibleRange({ start: 0, end: Math.min(12, sorted.length) });
    setHasMoreProducts(sorted.length > 12);
  }, [sort]);

  const toggleWishlist = (productId) => {
    const newWishlist = new Set(wishlist);
    if (newWishlist.has(productId)) {
      newWishlist.delete(productId);
      showNotification('Removed from wishlist', 'info');
    } else {
      newWishlist.add(productId);
      showNotification('Added to wishlist ❤️', 'success');
    }
    setWishlist(newWishlist);
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
      showNotification(`Updated ${product.name} quantity in cart`, 'success');
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
      showNotification(`${product.name} added to cart! 🛒`, 'success');
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
    showNotification('Item removed from cart', 'info');
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(cart.map(item => 
      item.id === productId 
        ? { ...item, quantity }
        : item
    ));
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  const openQuickView = (product) => {
    setSelectedProduct(product);
    setShowQuickView(true);
  };

  const getTotalCartItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalCartPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const loadMoreProducts = () => {
    if (loading || !hasMoreProducts) return;
    
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const nextEnd = Math.min(visibleRange.end + 8, sortedProducts.length);
      setVisibleRange(prev => ({
        start: Math.max(0, nextEnd - 24),
        end: nextEnd
      }));
      
      setLoading(false);
      setHasMoreProducts(nextEnd < sortedProducts.length);
    }, 500);
  };
  
  const unloadProducts = () => {
    if (visibleRange.start <= 0) return;
    
    const newStart = Math.max(0, visibleRange.start - 8);
    setVisibleRange(prev => ({
      start: newStart,
      end: Math.min(prev.end, newStart + 24)
    }));
  };

  const getVisibleProducts = () => {
    return sortedProducts.slice(visibleRange.start, visibleRange.end);
  };

  // Track scroll direction and position
  useEffect(() => {
    const handleScroll = () => {
      const currentPosition = window.pageYOffset || document.documentElement.scrollTop;
      setIsScrollingDown(currentPosition > scrollPosition);
      setScrollPosition(currentPosition);
      
      // Calculate if we're near the bottom of the page
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPercentage = (currentPosition / scrollHeight) * 100;
      
      // Load more when near bottom and scrolling down
      if (scrollPercentage > 70 && isScrollingDown) {
        loadMoreProducts();
      }
      
      // Unload products when scrolling up
      if (scrollPercentage < 30 && !isScrollingDown) {
        unloadProducts();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollPosition, isScrollingDown]);

  const handleHomeClick = () => {
    navigate('/');
  };

  // All available products (Hair care products)
  const allProducts = [
    {
      id: 1,
      name: "CHEKORGANICS – Noni Herbal Hair Pack 250gm",
      price: 1999,
      originalPrice: 2399,
      image: "https://res.cloudinary.com/dgq3d45tf/image/upload/v1757929702/Hairpack1_nqrkux.webp",
      inStock: true,
      rating: 4.6,
      reviews: 98,
      discount: 17
    },
    {
      id: 2,
      name: "CHEKORGANICS – Noni Herbal Hair Pack 100gm",
      price: 3499,
      originalPrice: 4199,
      image: "https://res.cloudinary.com/dgq3d45tf/image/upload/v1757929701/Hairpack_zdgec8.webp",
      inStock: true,
      rating: 4.7,
      reviews: 145,
      discount: 17
    },
    {
      id: 3,
      name: "CHEKORGANICS BODYHUES – Women DUDE HAIR ",
      price: 4999,
      originalPrice: 5999,
      image: "https://res.cloudinary.com/dgq3d45tf/image/upload/v1757928812/Hair_Oil_ora6jp.webp",
      inStock: true,
      rating: 4.8,
      reviews: 203,
      discount: 17
    },
    {
      id: 4,
      name: "NONI HERBAL SHAMPOO",
      price: 2999,
      originalPrice: 3599,
      image: "https://res.cloudinary.com/dgq3d45tf/image/upload/v1757929701/Nonishampooimgforcbopecommwebsite_oqaovs.webp",
      inStock: true,
      rating: 4.9,
      reviews: 167,
      discount: 17
    },
    {
      id: 5,
      name: "CHEKORGANICS BODYHUES – INSTARANG Noni Herbal Hair Color",
      price: 2799,
      originalPrice: 3299,
      image: "https://res.cloudinary.com/dgq3d45tf/image/upload/v1757929702/INSTARANGhaircolorimgforcbopecomm_x6qof7.webp",
      inStock: true,
      rating: 4.7,
      reviews: 189,
      discount: 15
    },
    {
      id: 6,
      name: "CHEKORGANICS BODYHUES – Men DUDE HAIR",
      price: 2799,
      originalPrice: 3299,
      image: "https://res.cloudinary.com/dgq3d45tf/image/upload/v1757930001/menshampoofront__nkvwzf.webp",
      inStock: true,
      rating: 4.7,
      reviews: 189,
      discount: 15
    },
    {
      id: 7,
      name: "CHEKORGANICS BODYHUES – MEN DUDE HAIR OIL 100ml",
      price: 2799,
      originalPrice: 3299,
      image: "https://res.cloudinary.com/dgq3d45tf/image/upload/v1757930214/menhairoilfront_ljkn30.webp",
      inStock: true,
      rating: 4.7,
      reviews: 189,
      discount: 15
    }

  ];

  const handleSort = (e) => {
    setSort(e.target.value);
  };

  return (
    <>
      <div className="container-fluid" style={{ background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)", minHeight: "80vh" }}>
        <div className="container-fluid px-4 py-4">
          {/* Category Header */}
          <div className="category-header text-center mb-4">
            <h1 className="display-4 fw-bold mb-2">💆‍♀️ HAIR CARE</h1>
            <p className="lead mb-0">Nourish your hair with natural and organic products</p>
          </div>

          {/* Top Controls */}
          <div className="bg-white rounded-3 shadow-sm p-3 mb-4">
            <div className="row align-items-center">
              {/* Sort Dropdown */}
              <div className="col-12 col-md-6 mb-3 mb-md-0">
                <div className="d-flex align-items-center flex-wrap gap-2">
                  <label className="text-muted small fw-bold mb-0">🔍 SORT BY:</label>
                  <select
                    value={sort}
                    onChange={handleSort}
                    className="form-select form-select-sm border-0 bg-light"
                    style={{ maxWidth: "200px" }}
                  >
                    <option value="latest">✨ Sort by latest</option>
                    <option value="low">💰 Price: Low to High</option>
                    <option value="high">💎 Price: High to Low</option>
                    <option value="name">🔤 Name A-Z</option>
                    <option value="rating">⭐ Highest Rated</option>
                  </select>
                </div>
              </div>

              {/* View Toggle & Product Count */}
              <div className="col-12 col-md-6">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-3">
                    <span className="text-muted small">
                      Showing <strong>{getVisibleProducts().length}</strong> of <strong>{sortedProducts.length}</strong> products
                    </span>
                    <button 
                      className="btn btn-outline-primary btn-sm position-relative"
                      onClick={() => setShowCart(true)}
                    >
                      🛒 Cart ({getTotalCartItems()})
                      {getTotalCartItems() > 0 && (
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                          {getTotalCartItems()}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
            {getVisibleProducts().map((product) => (
              <div key={`${product.id}-${visibleRange.start}`} className="col">
                <div
                  className={`card product-card h-100 position-relative overflow-hidden text-center`}
                  style={{
                    minHeight: "380px",
                    border: "1px solid #e9ecef",
                    borderRadius: "8px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                    transition: "all 0.3s ease",
                    backgroundColor: "#ffffff"
                  }}
                  onMouseEnter={() => {
                    setHoveredCard(product.id);
                  }}
                  onMouseLeave={() => {
                    setHoveredCard(null);
                  }}
                >
                  {/* Discount Badge */}
                  {product.discount && (
                    <div className="position-absolute top-0 start-0 m-2 z-3">
                    <span className="discount-badge">
                      -{product.discount}%
                    </span>
                  </div>
                  )}
                  
                  {/* Top-right buttons */}
                  <div className="card-buttons">
                    <button 
                      className="btn btn-wishlist"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(product.id);
                      }}
                      title={wishlist.has(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    >
                      {wishlist.has(product.id) ? '❤️' : '🤍'}
                    </button>
                    <button 
                      className="btn btn-share"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (navigator.share) {
                          navigator.share({
                            title: product.name,
                            text: 'Check out this product!',
                            url: window.location.href,
                          });
                        } else {
                          navigator.clipboard.writeText(window.location.href);
                          showNotification('Link copied to clipboard!', 'success');
                        }
                      }}
                      title="Share"
                    >
                      ↗️
                    </button>
                  </div>
                  <div className="card-body text-center p-3">
                    {/* Product Image */}
                    <div 
                      className="mb-3 position-relative overflow-hidden d-flex align-items-center justify-content-center" 
                      style={{ 
                        borderRadius: "8px", 
                        height: "200px", 
                        backgroundColor: "#f8f9fa",
                        cursor: "pointer"
                      }}
                      onClick={() => openQuickView(product)}
                      title="Click to view details"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="img-fluid product-image"
                        style={{
                          maxHeight: "190px",
                          maxWidth: "100%",
                          objectFit: "contain",
                          borderRadius: "6px",
                          transition: "transform 0.3s ease"
                        }}
                      />
                    </div>

                    {/* Product Info */}
                    <h6 className="card-title fw-normal mb-2 text-center" style={{ 
                      fontSize: "0.85rem",
                      minHeight: "35px",
                      color: "#495057",
                      lineHeight: "1.3"
                    }}>
                      {product.name}
                    </h6>
                    
                    {/* Price */}
                    <div className="mb-3 text-center">
                      <div className="h6 fw-bold text-dark mb-1">
                        ₹{product.price.toLocaleString()}
                      </div>
                      {product.originalPrice && (
                        <small className="text-muted text-decoration-line-through d-block">
                          ₹{product.originalPrice.toLocaleString()}
                        </small>
                      )}
                    </div>

                    {/* Hover Actions */}
                    {hoveredCard === product.id ? (
                      <div className="d-flex justify-content-center gap-2 mb-2">
                        <button 
                          className="btn btn-add-to-cart"
                          onClick={() => addToCart(product)}
                        >
                          <span>🛒</span>
                          <span>ADD TO CART</span>
                        </button>
                      </div>
                    ) : (
                      <div className="d-flex justify-content-center">
                        <button 
                          className="btn btn-add-to-cart"
                          onClick={() => addToCart(product)}
                        >
                          <span>🛒</span>
                          <span>ADD TO CART</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {loading && (
            <div className="text-center my-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}
          
          {/* End of Products Message */}
          {!hasMoreProducts && getVisibleProducts().length > 8 && (
            <div className="text-center mt-5">
              <div className="alert alert-info d-inline-block">
                <i className="bi bi-check-circle me-2">✅</i>
                You've seen all products! ({sortedProducts.length} total)
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notification Toast */}
      {notification.show && (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 9999 }}>
          <div className={`alert alert-${
            notification.type === 'success' ? 'success' : 
            notification.type === 'info' ? 'info' : 'warning'
          } alert-dismissible fade show`} role="alert">
            <strong>{notification.message}</strong>
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setNotification({ show: false, message: '', type: '' })}
            ></button>
          </div>
        </div>
      )}

      {/* Cart Modal */}
      {showCart && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="bi bi-cart3 me-2">🛒</i>
                  Shopping Cart ({getTotalCartItems()})
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowCart(false)}
                ></button>
              </div>
              <div className="modal-body">
                {cart.length === 0 ? (
                  <div className="text-center py-5">
                    <div className="mb-3" style={{ fontSize: '4rem' }}>🛒</div>
                    <h5 className="text-muted">Your cart is empty</h5>
                    <p className="text-muted">Add some amazing toys to get started!</p>
                  </div>
                ) : (
                  <div>
                    {cart.map((item) => (
                      <div key={item.id} className="row align-items-center border-bottom py-3">
                        <div className="col-3">
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="img-fluid rounded"
                            style={{ height: '80px', objectFit: 'cover' }}
                          />
                        </div>
                        <div className="col-6">
                          <h6 className="mb-1">{item.name}</h6>
                          <div className="text-success fw-bold">
                            ₹{item.price.toLocaleString()}
                          </div>
                          {item.originalPrice && (
                            <small className="text-muted text-decoration-line-through">
                              ₹{item.originalPrice.toLocaleString()}
                            </small>
                          )}
                        </div>
                        <div className="col-3">
                          <div className="d-flex align-items-center justify-content-between">
                            <div className="input-group input-group-sm" style={{ maxWidth: '100px' }}>
                              <button 
                                className="btn btn-outline-secondary"
                                onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                              >
                                -
                              </button>
                              <input 
                                type="text" 
                                className="form-control text-center" 
                                value={item.quantity}
                                readOnly
                              />
                              <button 
                                className="btn btn-outline-secondary"
                                onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                              >
                                +
                              </button>
                            </div>
                            <button 
                              className="btn btn-outline-danger btn-sm ms-2"
                              onClick={() => removeFromCart(item.id)}
                              title="Remove item"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {cart.length > 0 && (
                <div className="modal-footer">
                  <div className="w-100">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="mb-0">Total: ₹{getTotalCartPrice().toLocaleString()}</h5>
                      <div>
                        <button 
                          className="btn btn-outline-secondary me-2"
                          onClick={() => setShowCart(false)}
                        >
                          Continue Shopping
                        </button>
                        <button className="btn btn-success">
                          💳 Checkout
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {showQuickView && selectedProduct && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{selectedProduct.name}</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowQuickView(false)}
                ></button>
              </div>
              <div className="modal-body">
                <ImageZoom 
                  src={selectedProduct.image} 
                  alt={selectedProduct.name}
                  height="400px"
                >
                  <div className="product-details">
                    <h3 className="fw-bold text-dark mb-3">{selectedProduct.name}</h3>
                    
                    {/* Rating */}
                    <div className="d-flex align-items-center mb-3">
                      <div className="text-warning me-2">
                        {"⭐".repeat(Math.floor(selectedProduct.rating))}
                        <span className="text-muted ms-1">({selectedProduct.rating})</span>
                      </div>
                      <span className="text-muted">| {selectedProduct.reviews} reviews</span>
                    </div>
                    
                    {/* Price */}
                    <div className="mb-4">
                      <div className="d-flex align-items-center gap-3">
                        <h2 className="text-success fw-bold mb-0">
                          ₹{selectedProduct.price.toLocaleString()}
                        </h2>
                        {selectedProduct.originalPrice && (
                          <>
                            <span className="text-muted text-decoration-line-through h5">
                              ₹{selectedProduct.originalPrice.toLocaleString()}
                            </span>
                            <span className="badge bg-success">
                              {selectedProduct.discount}% OFF
                            </span>
                          </>
                        )}
                      </div>
                      <small className="text-muted">Inclusive of all taxes</small>
                    </div>
                    
                    {/* Product Features */}
                    <div className="mb-4">
                      <h6 className="fw-bold">Product Highlights:</h6>
                      <ul className="list-unstyled">
                        <li className="mb-2">
                          <i className="bi bi-check-circle-fill text-success me-2"></i>
                          ✅ Safe and non-toxic materials
                        </li>
                        <li className="mb-2">
                          <i className="bi bi-check-circle-fill text-success me-2"></i>
                          🏆 Award-winning design
                        </li>
                        <li className="mb-2">
                          <i className="bi bi-check-circle-fill text-success me-2"></i>
                          🚚 Free shipping on orders above ₹500
                        </li>
                        <li className="mb-2">
                          <i className="bi bi-check-circle-fill text-success me-2"></i>
                          🔄 Easy 30-day return policy
                        </li>
                      </ul>
                    </div>
                    
                    {/* Stock Status */}
                    <div className="mb-4">
                      <div className="d-flex align-items-center">
                        <span className="badge bg-success me-2">✓ In Stock</span>
                        <small className="text-muted">Only 5 left in stock!</small>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="d-flex gap-2 mt-4 align-items-center">
                      <button 
                        className="btn btn-cart text-white fw-semibold btn-add-to-cart flex-grow-1"
                        onClick={() => {
                          addToCart(selectedProduct);
                          setShowQuickView(false);
                        }}
                      >
                        🛒 ADD TO CART
                      </button>
                      
                      <button 
                        className="btn btn-wishlist"
                        onClick={() => toggleWishlist(selectedProduct.id)}
                        title={wishlist.has(selectedProduct.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                      >
                        {wishlist.has(selectedProduct.id) ? '❤️' : '🤍'}
                      </button>
                      
                      <button 
                        className="btn btn-share"
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({
                              title: selectedProduct.name,
                              text: 'Check out this amazing product!',
                              url: window.location.href,
                            });
                          } else {
                            navigator.clipboard.writeText(window.location.href);
                            showNotification('Link copied to clipboard!', 'success');
                          }
                        }}
                        title="Share"
                      >
                        ↗️
                      </button>
                    </div>
                  </div>
                </ImageZoom>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default HairCare;
