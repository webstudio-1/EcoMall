import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getJson } from '../services/api';
import { useCartWishlist } from '../context/CartWishlistContext.jsx';

export default function ProductDetails() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { addToCart, addToWishlist } = useCartWishlist();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError('');
        const data = await getJson(`/EcoMall/items/${id}/`);
        if (!cancelled) setItem(data);
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load product');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) return <div className="container py-4">Loading...</div>;
  if (error) return <div className="container py-4 alert alert-danger">{error}</div>;
  if (!item) return null;

  const card = {
    id: item.item_id,
    title: item.item_name,
    image: item.image,
    price: item.selling_price != null ? `₹${Number(item.selling_price).toFixed(2)}` : '',
  };

  return (
    <div className="container py-4">
      <div className="row g-4">
        <div className="col-md-6 text-center">
          <img src={card.image} alt={card.title} className="img-fluid" style={{ maxHeight: 420, objectFit: 'contain' }} />
        </div>
        <div className="col-md-6">
          <h3 className="mb-2">{card.title}</h3>
          <div className="fs-3 text-success mb-3">{card.price}</div>
          <div className="mb-3 text-muted">Inclusive of all taxes</div>
          <div className="d-flex gap-2 mb-4">
            <button className="btn btn-success" onClick={() => addToCart(card)}>ADD TO CART</button>
            <button className="btn btn-outline-secondary" onClick={() => addToWishlist(card)}>ADD TO WISHLIST</button>
          </div>

          <div className="mt-4">
            <h5>Details</h5>
            <ul className="list-unstyled small text-muted">
              <li><strong>Category:</strong> {item.category}</li>
              <li><strong>Sub Category:</strong> {item.sub_category || '—'}</li>
              <li><strong>Stock:</strong> {item.stock_quantity}</li>
              <li><strong>Actual Price:</strong> {item.actual_price}</li>
              <li><strong>Selling Price:</strong> {item.selling_price}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
