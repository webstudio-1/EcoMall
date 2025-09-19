import React from 'react';
import { useCartWishlist } from '../context/CartWishlistContext.jsx';

export default function Wishlist() {
  const { wishlist, removeWishlistEntry, addToCart } = useCartWishlist();

  // Inline CSS styles
  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem 1rem'
    },
    title: {
      fontWeight: '700',
      color: '#2c3e50',
      marginBottom: '2rem',
      fontSize: '2rem'
    },
    emptyBanner: {
      textAlign: 'center',
      padding: '3rem',
      backgroundColor: '#f8f9fa',
      borderRadius: '12px',
      color: '#6c757d'
    },
    emptyIcon: {
      fontSize: '4rem',
      marginBottom: '1rem',
      color: '#dee2e6'
    },
    card: {
      border: 'none',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      overflow: 'hidden',
      height: '100%'
    },
    cardHover: {
      transform: 'translateY(-5px)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
    },
    itemThumb: {
      width: '140px',
      height: '140px',
      objectFit: 'contain',
      borderRadius: '8px',
      flexShrink: '0'
    },
    productTitle: {
      fontWeight: '600',
      fontSize: '1.1rem',
      marginBottom: '0.75rem',
      color: '#2c3e50',
      display: '-webkit-box',
      WebkitLineClamp: '2',
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
      minHeight: '3.2rem'
    },
    price: {
      fontWeight: '700',
      fontSize: '1.25rem',
      color: '#28a745'
    },
    addToCartBtn: {
      backgroundColor: '#46c919',
      color: '#ffffff',
      border: '1px solid #46c919',
      borderRadius: '6px',
      padding: '0.5rem 1rem',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    removeBtn: {
      backgroundColor: 'transparent',
      color: '#dc3545',
      border: '1px solid #dc3545',
      borderRadius: '6px',
      padding: '0.5rem 1rem',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    actionRow: {
      display: 'flex',
      gap: '0.75rem',
      flexWrap: 'wrap'
    },
    metaRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '1rem'
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Your Wishlist</h3>
      {wishlist.length === 0 ? (
        <div style={styles.emptyBanner}>
          <div style={styles.emptyIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" viewBox="0 0 16 16">
              <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z"/>
            </svg>
          </div>
          <h5>Your wishlist is empty</h5>
          <p>Start adding items you love!</p>
        </div>
      ) : (
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem'}}>
          {wishlist.map((p) => (
            <div key={p.wishlistId || p.id} style={styles.card} onMouseEnter={(e) => {
              e.currentTarget.style.transform = styles.cardHover.transform;
              e.currentTarget.style.boxShadow = styles.cardHover.boxShadow;
            }} onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = styles.card.boxShadow;
            }}>
              <div style={{padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%'}}>
                <div style={{textAlign: 'center', marginBottom: '1rem'}}>
                  <img src={p.image} alt={p.title} style={styles.itemThumb} />
                </div>
                <div style={{flexGrow: 1, marginBottom: '1rem'}}>
                  <div style={styles.productTitle} title={p.title}>{p.title}</div>
                  <div style={styles.metaRow}>
                    <div style={styles.price}>{typeof p.price === 'number' ? `$${p.price.toFixed(2)}` : p.price}</div>
                    <div style={styles.actionRow}>
                      <button
                        style={styles.addToCartBtn}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#3ab015'; e.currentTarget.style.borderColor = '#3ab015'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#46c919'; e.currentTarget.style.borderColor = '#46c919'; }}
                        onClick={() => addToCart(p)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M9 5.5a.5.5 0 0 0-1 0V7H6.5a.5.5 0 0 0 0 1H8v1.5a.5.5 0 0 0 1 0V8h1.5a.5.5 0 0 0 0-1H9V5.5z"/>
                          <path d="M.5 1a.5.5 0 0 0 0 1h1.11l.401 1.607 1.498 7.985A.5.5 0 0 0 4 12h1a2 2 0 1 0 0 4 2 2 0 0 0 0-4h7a2 2 0 1 0 0 4 2 2 0 0 0 0-4h1a.5.5 0 0 0 .491-.408l1.5-8A.5.5 0 0 0 14.5 3H2.89l-.405-1.621A.5.5 0 0 0 2 1H.5zm3.915 10L3.102 4h10.796l-1.313 7h-8.17z"/>
                        </svg>
                        Add to Cart
                      </button>
                      <button style={styles.removeBtn} onClick={() => removeWishlistEntry(p)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                          <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                        </svg>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}