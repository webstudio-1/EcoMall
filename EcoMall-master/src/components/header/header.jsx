import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./header.module.css";
import { FaUser, FaHeart, FaShoppingBag, FaSearch, FaChevronRight } from "react-icons/fa";
import logo from "../../assets/images/ecomall_logo.png";
import { useAuth } from "../../context/AuthContext.jsx";
import { getJson } from "../../services/api";
import { useCartWishlist } from "../../context/CartWishlistContext.jsx";

const Header = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState(null);
  const [activeSubMenu, setActiveSubMenu] = useState(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);
  const hideTimer = useRef(null);
  // Menu data state from backend
  const [categoriesApi, setCategoriesApi] = useState(null);
  const [servicesApi, setServicesApi] = useState(null);
  const [menuError, setMenuError] = useState("");
  const { user, logout } = useAuth();
  const { cartCount, wishlistCount } = useCartWishlist();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Load menus from backend and split into Products and Services
  useEffect(() => {
    let cancelled = false;
    async function loadMenu() {
      try {
        setMenuError("");
        const data = await getJson('/EcoMall/menu/tree/');
        if (cancelled) return;
        // Prepare two maps
        const productsMap = {};
        const servicesMap = {};
        (data || []).forEach(mc => {
          const mainName = (mc.main_category_name || '').toLowerCase();
          const target =
            mainName.includes('services') ? servicesMap :
            mainName.includes('products') ? productsMap : null;
          if (!target) return;
          (mc.categories || []).forEach(cat => {
            target[cat.category_name] = (cat.sub_categories || []).map(s => ({ id: s.sub_category_id, name: s.sub_category_name }));
          });
        });
        setCategoriesApi(Object.keys(productsMap).length ? productsMap : {});
        setServicesApi(Object.keys(servicesMap).length ? servicesMap : {});
      } catch (e) {
        if (!cancelled) setMenuError(e.message || 'Failed to load menu');
      }
    }
    loadMenu();
    return () => { cancelled = true; };
  }, []);

  // Use API data only
  const categories = categoriesApi || {};
  const services = servicesApi || {};

  // Navigate when submenu clicked
  const handleSubMenuClick = (categoryName, sub) => {
    if (sub && sub.id) {
      navigate(`/subcategory/${sub.id}`);
      setActiveMenu(null);
      setActiveSubMenu(null);
    }
  };

  // Toggle user dropdown
  const toggleUserDropdown = () => {
    setShowUserDropdown(!showUserDropdown);
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Dropdown open/close helpers to avoid flicker
  const cancelClose = () => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  };
  const scheduleClose = (delay = 150) => {
    cancelClose();
    hideTimer.current = setTimeout(() => {
      setActiveSubMenu(null);
      setActiveMenu(null);
    }, delay);
  };

  return (
    <>
      <header className={styles.header}>
        {/* === Top Section (Logo, Search, Icons) === */}
        <div className={styles.topSection}>
          {/* Logo */}
          <div className={styles.logo}>
            <a href="/"><img src={logo} alt="EcoMall Logo" /></a>
          </div>

          {/* Search Bar */}
          <div className={styles.searchContainer}>
            <form onSubmit={handleSearch} className={styles.searchForm}>
              <div className={styles.searchInputGroup}>
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder="Search for eco-friendly products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className={styles.searchButton}>
                  <FaSearch size={16} />
                </button>
              </div>
            </form>
          </div>

          {/* Icons */}
          <div className={styles.iconsContainer} ref={dropdownRef}>
            <div className={styles.iconWrapper}>
              <FaUser 
                size={20} 
                className={`${styles.icon} ${showUserDropdown ? styles.activeIcon : ''}`} 
                onClick={toggleUserDropdown}
              />
              {/* User Dropdown */}
              {showUserDropdown && (
                <div className={styles.userDropdown}>
                  <ul className={styles.dropdownList}>
                    {user ? (
                      <>
                        <li className={styles.userInfo}>
                          <div className={styles.userName}>
                            {user.first_name || user.email}
                          </div>
                          <div className={styles.userEmail}>{user.email}</div>
                        </li>
                        
                      </>
                    ) : (
                      <li 
                        className={`${styles.dropdownItem} ${window.location.pathname === '/login' ? styles.activeDropdownItem : ''}`} 
                        onClick={() => navigate('/login')}
                      >
                        Login/Register
                      </li>
                    )}
                    
                    <li
                      className={`${styles.dropdownItem} ${window.location.pathname === '/my-profile' ? styles.activeDropdownItem : ''}`} 
                      onClick={() => navigate('/my-profile')}
                    >
                      My Profile
                    </li>
                    <li 
                      className={`${styles.dropdownItem} ${window.location.pathname === '/paymentMethods' ? styles.activeDropdownItem : ''}`} 
                      onClick={() => navigate('/paymentMethods')}
                    >
                      Payment Methods
                    </li>
                    {user && (
                      <li 
                        className={styles.dropdownItem}
                        onClick={() => { logout(); setShowUserDropdown(false); navigate('/'); }}
                      >
                        Logout
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
            
            <div className={styles.iconWrapper} onClick={() => navigate('/wishlist')}>
              <FaHeart size={20} className={styles.icon} />
              {wishlistCount > 0 && (
                <span className={styles.badge}>{wishlistCount}</span>
              )}
            </div>
            
            <div className={styles.iconWrapper} onClick={() => navigate('/cart')}>
              <FaShoppingBag size={20} className={styles.icon} />
              {cartCount > 0 && (
                <span className={styles.badge}>{cartCount}</span>
              )}
            </div>
          </div>
        </div>
   
        {/* === Navigation Links === */}
        <nav
          className={styles.navContainer}
          onMouseEnter={cancelClose}
          onMouseLeave={() => scheduleClose(150)}
        >
          <ul className={styles.navList}>
            {/* Eco-Friendly Products Dropdown (only if data exists) */}
            {Object.keys(categories).length > 0 && (
              <li
                className={`${styles.navItem} ${activeMenu === 'eco-products' ? styles.activeNavItem : ''}`}
                onMouseEnter={() => setActiveMenu("eco-products")}
              >
                Eco-Friendly Products
                {activeMenu === "eco-products" && (
                  <div
                    className={styles.megaDropdown}
                    onMouseEnter={() => { cancelClose(); setActiveMenu("eco-products"); }}
                    onMouseLeave={() => scheduleClose(150)}
                  >
                    <div className={styles.megaDropdownContent}>
                      <ul className={styles.megaDropdownList}>
                        {Object.entries(categories).map(([category, subCategories]) => (
                          <li
                            key={category}
                            className={styles.megaDropdownItem}
                            onMouseEnter={() => setActiveSubMenu(category)}
                            onClick={(e) => { e.stopPropagation(); }}
                          >
                            <div className={styles.categoryTitle}>
                              <span>{category}</span>
                              {(Array.isArray(subCategories) && subCategories.length > 0) && (
                                <FaChevronRight size={12} className={styles.chevron} />
                              )}
                            </div>
                            
                            {activeSubMenu === category && Array.isArray(subCategories) && subCategories.length > 0 && (
                              <div
                                className={styles.submenu}
                                onMouseEnter={() => setActiveSubMenu(category)}
                                onMouseLeave={() => setActiveSubMenu(null)}
                              >
                                <ul className={styles.submenuList}>
                                  {(Array.isArray(subCategories) ? subCategories : []).map((subCategory) => (
                                    <li
                                      key={subCategory.id || subCategory.name}
                                      className={styles.submenuItem}
                                      onClick={() => handleSubMenuClick(category, subCategory)}
                                    >
                                      {subCategory.name || subCategory}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </li>
            )}

            {/* Other Menu Items */}
            <li 
              className={styles.navItem}
              onClick={() => navigate('/athykl')}
            >
              Athykl
            </li>
            
            {/* Eco-Friendly Services Dropdown */}
            <li
              className={`${styles.navItem} ${activeMenu === 'eco-services' ? styles.activeNavItem : ''}`}
              onMouseEnter={() => setActiveMenu("eco-services")}
            >
              Eco-Friendly Services
              {activeMenu === "eco-services" && (
                <div
                  className={styles.megaDropdown}
                  onMouseEnter={() => { cancelClose(); setActiveMenu("eco-services"); }}
                  onMouseLeave={() => scheduleClose(150)}
                >
                  <div className={styles.megaDropdownContent}>
                    <ul className={styles.megaDropdownList}>
                      {Object.entries(services).map(([service, subServices]) => (
                        <li
                          key={service}
                          className={styles.megaDropdownItem}
                          onMouseEnter={() => setActiveSubMenu(service)}
                        >
                          <div className={styles.categoryTitle}>
                            <span>{service}</span>
                            {(Array.isArray(subServices) && subServices.length > 0) && (
                              <FaChevronRight size={12} className={styles.chevron} />
                            )}
                          </div>
                          
                          {activeSubMenu === service && Array.isArray(subServices) && subServices.length > 0 && (
                            <div
                              className={styles.submenu}
                              onMouseEnter={() => setActiveSubMenu(service)}
                              onMouseLeave={() => setActiveSubMenu(null)}
                            >
                              <ul className={styles.submenuList}>
                                {(Array.isArray(subServices) ? subServices : []).map((subService) => (
                                  <li
                                    key={subService.id || subService.name || String(subService)}
                                    className={styles.submenuItem}
                                  >
                                    {subService.name || String(subService)}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </li>
            
            <li 
              className={styles.navItem}
              onClick={() => navigate('/sweet-heart')}
            >
              Sweet Heart
            </li>
          </ul>
        </nav>
      </header>
    </>
  );
};

export default Header;