import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartWishlist } from '../context/CartWishlistContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { postJson } from '../services/api';
import { FaMinus, FaPlus, FaMapMarkerAlt, FaTrash, FaHeart, FaEdit, FaTimes } from 'react-icons/fa';

export default function Cart() {
  const { cart, removeCartEntry, updateCartQuantity, addToWishlist } = useCartWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();

  // State for address management
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [address, setAddress] = useState({
    pincode: '',
    city: '',
    state: '',
    line1: '',
    line2: '',
  });

  // Sample saved addresses (in a real app, these would come from backend/context)
  const [savedAddresses, setSavedAddresses] = useState([
    {
      id: 1,
      pincode: '560001',
      city: 'Bengaluru',
      state: 'Karnataka',
      line1: '123 Main Street',
      line2: 'Near Central Mall',
      isDefault: true
    },
    {
      id: 2,
      pincode: '560002',
      city: 'Bengaluru',
      state: 'Karnataka',
      line1: '456 Park Avenue',
      line2: 'Opposite City Hospital',
      isDefault: false
    }
  ]);

  const [selectedAddress, setSelectedAddress] = useState(1); // Default to first address

  const subtotal = cart.reduce((sum, p) => {
    const unit = Number(String(p.price).replace(/[^\d.]/g, '')) || 0;
    const qty = p.quantity || 1;
    return sum + unit * qty;
  }, 0);
  const discount = 0; // placeholder for future coupons/discounts
  const platformFee = cart.length ? 7 : 0; // small sample fee
  // GST slabs based on subtotal
  const gstRate = subtotal <= 500 ? 0.25
                : subtotal <= 1000 ? 0.20
                : subtotal <= 2500 ? 0.18
                : 0.16; // 2501 - 5000 and above use 16%
  const gstAmount = subtotal * gstRate;
  const deliveryFee = subtotal > 499 ? 0 : 40;
  const total = Math.max(0, subtotal - discount + gstAmount + platformFee + deliveryFee);

  // Place order state
  const [placing, setPlacing] = useState(false);

  const loadRazorpayScript = () => new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const extractUnitPrice = (p) => {
    // p.price can be like '₹123.00' or a number
    const unit = typeof p.price === 'number' ? p.price : (Number(String(p.price).replace(/[^\d.]/g, '')) || 0);
    return unit;
  };

  const handlePlaceOrder = async () => {
    if (!user?.user_id) {
      alert('Please login to place an order');
      return;
    }
    if (!cart.length) return;
    setPlacing(true);
    try {
      const itemsPayload = cart.map((p) => ({
        item_id: p.itemId || p.id,
        quantity: p.quantity || 1,
        price: extractUnitPrice(p),
      }));
      const createRes = await postJson('/EcoMall/create-order/', {
        user_id: user.user_id,
        items: itemsPayload,
        total_amount: Number(total.toFixed(2)),
      });
      if (!createRes || !createRes.razorpay_order_id) {
        throw new Error('Failed to create Razorpay order.');
      }

      const ok = await loadRazorpayScript();
      if (!ok) {
        alert('Failed to load Razorpay. Please try again.');
        setPlacing(false);
        return;
      }

      const options = {
        key: 'rzp_test_3HM3cOG18rWK8Y', // public key; move to env if needed
        // When providing order_id, amount is not required in options
        currency: createRes.currency || 'INR',
        name: 'Eco Mall',
        description: 'Order Payment',
        order_id: createRes.razorpay_order_id,
        handler: async function (response) {
          try {
            const verifyRes = await postJson('/EcoMall/verify-payment/', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            // Clear cart locally
            for (const p of cart) {
              // best-effort; ignore failures
              try { await removeCartEntry(p); } catch {}
            }
            // Navigate to invoice with details
            const selectedAddr = savedAddresses.find(a => a.id === selectedAddress) || {};
            const itemsForInvoice = cart.map(p => ({
              item_id: p.itemId || p.id,
              title: p.title,
              image: p.image,
              quantity: p.quantity || 1,
              price: extractUnitPrice(p),
            }));
            navigate(`/invoice/${verifyRes.order_id || createRes.order_id}`, {
              state: {
                booked_reference: verifyRes.booked_reference,
                payment_id: response.razorpay_payment_id,
                items: itemsForInvoice,
                subtotal,
                gstRate,
                gstAmount,
                platformFee,
                deliveryFee,
                total,
                customer: {
                  name: user?.first_name ? `${user.first_name} ${user.last_name || ''}` : '',
                  email: user?.email,
                  phone: user?.mobile_number,
                },
                address: selectedAddr,
              }
            });
          } catch (e) {
            alert('Payment verification failed. Please contact support.');
          } finally {
            setPlacing(false);
          }
        },
        modal: {
          ondismiss: async function () {
            // Optionally mark pending
            setPlacing(false);
          }
        },
        prefill: {
          name: user?.first_name ? `${user.first_name} ${user.last_name || ''}` : '',
          email: user?.email || '',
          contact: user?.mobile_number || ''
        },
        theme: { color: '#46c919' }
      };
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp) {
        alert('Payment failed. Please try again.');
        setPlacing(false);
      });
      rzp.open();
    } catch (e) {
      console.error('Place order failed', e);
      console.error('create-order / Razorpay error:', e);
      alert(e?.message || 'Unable to create order.');
      setPlacing(false);
    }
  };

  // Handle address form submission
  const handleAddressSubmit = (e) => {
    e.preventDefault();
    if (editingAddress) {
      // Update existing address
      const updatedAddresses = savedAddresses.map(addr =>
        addr.id === editingAddress ? {...address, id: editingAddress} : addr
      );
      setSavedAddresses(updatedAddresses);
    } else {
      // Add new address
      const newAddress = {
        ...address,
        id: Date.now(), // Simple ID generation
        isDefault: savedAddresses.length === 0 // Set as default if first address
      };
      setSavedAddresses([...savedAddresses, newAddress]);
    }
    setShowAddressForm(false);
    setEditingAddress(null);
    setAddress({
      pincode: '',
      city: '',
      state: '',
      line1: '',
      line2: '',
    });
  };

  // Handle address deletion
  const handleDeleteAddress = (id) => {
    if (savedAddresses.length <= 1) {
      alert("You must have at least one saved address");
      return;
    }

    const updatedAddresses = savedAddresses.filter(addr => addr.id !== id);
    setSavedAddresses(updatedAddresses);

    if (selectedAddress === id) {
      setSelectedAddress(updatedAddresses[0].id);
    }
  };

  // Handle editing an address
  const handleEditAddress = (id) => {
    const addressToEdit = savedAddresses.find(addr => addr.id === id);
    if (addressToEdit) {
      setAddress({...addressToEdit});
      setEditingAddress(id);
      setShowAddressForm(true);
    }
  };

  // Set default address
  const setDefaultAddress = (id) => {
    const updatedAddresses = savedAddresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    }));
    setSavedAddresses(updatedAddresses);
  };

  return (
    <div className="container py-4">
      <h3 className="mb-4 fw-bold">Your Cart</h3>
      {cart.length === 0 ? (
        <div className="text-center py-5">
          <div className="empty-cart-icon mb-3">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 2H4.5L4.956 4M4.956 4L6.5 11.5M4.956 4H21L19 15H6.5M6.5 11.5L5 18.5H19M6.5 11.5H19M19 15V18.5M9 20C9 20.5523 8.55228 21 8 21C7.44772 21 7 20.5523 7 20C7 19.4477 7.44772 19 8 19C8.55228 19 9 19.4477 9 20ZM19 20C19 20.5523 18.5523 21 18 21C17.4477 21 17 20.5523 17 20C17 19.4477 17.4477 19 18 19C18.5523 19 19 19.4477 19 20Z" stroke="#6c757d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h5 className="text-muted">Your cart is empty</h5>
          <p className="text-muted mb-4">Looks like you haven't added anything to your cart yet</p>
          <button className="btn btn-primary">Continue Shopping</button>
        </div>
      ) : (
        <div className="row g-4">
          {/* Left section: Items */}
          <div className="col-lg-8">
            {/* Items list */}
            <div className="card shadow-sm cart-items-card">
              <div className="card-header bg-white py-3">
                <h6 className="mb-0 fw-semibold">Cart Items ({cart.length})</h6>
              </div>
              {cart.map((p, idx) => (
                <div key={p.cartId || p.id} className={idx === 0 ? '' : 'border-top'}>
                  <div className="p-4 d-flex gap-4 align-items-start itemCard">
                    <img src={p.image} alt={p.title} className="itemThumb rounded" />
                    <div className="flex-grow-1 itemMeta">
                      <div className="productTitle fw-medium mb-1" title={p.title}>{p.title}</div>
                      <div className="text-muted small mb-2">Delivery in 3-5 days</div>
                      <div className="d-flex justify-content-between align-items-center flex-wrap mt-3">
                        <div className="price text-success fw-bold fs-5">{p.price}</div>
                        <div className="qtyGroup d-flex align-items-center">
                          <button className="btn btn-outline-secondary btn-sm rounded-circle d-flex align-items-center justify-content-center"
                            onClick={() => updateCartQuantity(p, Math.max(1, (p.quantity || 1) - 1))}>
                            <FaMinus size={10} />
                          </button>
                          <span className="qtyValue mx-3 fw-medium">{p.quantity || 1}</span>
                          <button className="btn btn-outline-secondary btn-sm rounded-circle d-flex align-items-center justify-content-center"
                            onClick={() => updateCartQuantity(p, (p.quantity || 1) + 1)}>
                            <FaPlus size={10} />
                          </button>
                        </div>
                      </div>
                      <div className="actionRow mt-3">
                        <button className="btn btn-link p-0 text-danger text-decoration-none d-inline-flex align-items-center"
                          onClick={() => removeCartEntry(p)}>
                          <FaTrash size={12} className="me-1" /> Remove
                        </button>
                        <span className="mx-3 text-muted">|</span>
                        <button
                          className="btn btn-link p-0 text-decoration-none d-inline-flex align-items-center"
                          onClick={async () => { await addToWishlist(p); await removeCartEntry(p); }}
                        >
                          <FaHeart size={12} className="me-1" /> Save for later
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="p-4 border-top d-flex justify-content-end">
                <button
                  className="btn fw-bold px-5 py-2"
                  style={{ backgroundColor: '#46c919', borderColor: '#46c919', color: '#ffffff', opacity: placing ? 0.8 : 1 }}
                  onClick={handlePlaceOrder}
                  disabled={placing || cart.length === 0}
                >
                  {placing ? 'PROCESSING...' : 'PLACE ORDER'}
                </button>
              </div>
            </div>
          </div>

          {/* Right section: Price details and Address */}
          <div className="col-lg-4">
            <div className="sticky-top-group" style={{top: '20px'}}>
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-white py-3 fw-semibold">PRICE DETAILS</div>
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between mb-3">
                    <div>Price ({cart.length} {cart.length === 1 ? 'item' : 'items'})</div>
                    <div>₹{subtotal.toFixed(2)}</div>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <div>Discount</div>
                    <div className="text-success">− ₹{discount.toFixed(2)}</div>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <div>GST ({Math.round(gstRate * 100)}%)</div>
                    <div>₹{gstAmount.toFixed(2)}</div>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <div>Platform Fee</div>
                    <div>₹{platformFee.toFixed(2)}</div>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <div>Delivery Fee</div>
                    <div>{subtotal > 499 ? <span className="text-success">FREE</span> : '₹40.00'}</div>
                  </div>
                  <hr className="my-3" />
                  <div className="d-flex justify-content-between fw-bold fs-5 mb-3">
                    <div>Total Amount</div>
                    <div>₹{total.toFixed(2)}</div>
                  </div>
                  {discount > 0 && (
                    <div className="alert alert-success py-2 small mb-0">
                      You will save ₹{discount.toFixed(2)} on this order
                    </div>
                  )}
                  {subtotal < 499 && (
                    <div className="alert alert-info py-2 small mt-3">
                      Add ₹{(499 - subtotal).toFixed(2)} more for free delivery!
                    </div>
                  )}
                </div>
              </div>

              {/* Select Delivery Address */}
              <div className="card shadow-sm">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <FaMapMarkerAlt className="text-primary me-2" />
                    <h6 className="mb-0 fw-semibold">Select Delivery Address</h6>
                  </div>

                  <div className="saved-addresses mb-3">
                    {savedAddresses.map(addr => (
                      <div
                        key={addr.id}
                        className={`address-card p-3 mb-3 rounded ${selectedAddress === addr.id ? 'selected' : ''}`}
                        onClick={() => setSelectedAddress(addr.id)}
                      >
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="addressSelection"
                            checked={selectedAddress === addr.id}
                            onChange={() => setSelectedAddress(addr.id)}
                          />
                          <label className="form-check-label w-100">
                            <div className="d-flex justify-content-between">
                              <span className="fw-medium">{addr.line1}</span>
                              {addr.isDefault && (
                                <span className="badge bg-primary">Default</span>
                              )}
                            </div>
                            <p className="mb-1 text-muted small">{addr.line2}</p>
                            <p className="mb-1 text-muted small">{addr.city}, {addr.state} - {addr.pincode}</p>
                          </label>
                        </div>

                        <div className="address-actions mt-2">
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditAddress(addr.id);
                            }}
                          >
                            <FaEdit className="me-1" /> Edit
                          </button>
                          {!addr.isDefault && (
                            <button
                              className="btn btn-sm btn-outline-secondary me-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDefaultAddress(addr.id);
                              }}
                            >
                              Set Default
                            </button>
                          )}
                          {savedAddresses.length > 1 && (
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteAddress(addr.id);
                              }}
                            >
                              <FaTrash />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    className="btn btn-outline-primary rounded-pill px-4"
                    onClick={() => {
                      setEditingAddress(null);
                      setAddress({
                        pincode: '',
                        city: '',
                        state: '',
                        line1: '',
                        line2: '',
                      });
                      setShowAddressForm(true);
                    }}
                  >
                    + Add New Address
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Address Form Modal */}
      {showAddressForm && (
        <div className="modal-backdrop show d-block" onClick={() => setShowAddressForm(false)}>
          <div className="modal d-block" tabIndex="-1" onClick={e => e.stopPropagation()}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{editingAddress ? 'Edit Address' : 'Add New Address'}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowAddressForm(false)}>
                    <FaTimes />
                  </button>
                </div>
                <form onSubmit={handleAddressSubmit}>
                  <div className="modal-body">
                    <div className="row g-3">
                      <div className="col-md-4">
                        <label className="form-label fw-medium">Pincode *</label>
                        <input
                          className="form-control"
                          value={address.pincode}
                          onChange={(e)=>setAddress({...address,pincode:e.target.value})}
                          placeholder="e.g. 560001"
                          required
                        />
                      </div>
                      <div className="col-md-5">
                        <label className="form-label fw-medium">City *</label>
                        <input
                          className="form-control"
                          value={address.city}
                          onChange={(e)=>setAddress({...address,city:e.target.value})}
                          placeholder="City"
                          required
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label fw-medium">State *</label>
                        <input
                          className="form-control"
                          value={address.state}
                          onChange={(e)=>setAddress({...address,state:e.target.value})}
                          placeholder="State"
                          required
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-medium">Nearby Landmark</label>
                        <input
                          className="form-control"
                          value={address.line1}
                          onChange={(e)=>setAddress({...address,line1:e.target.value})}
                          placeholder="House no., Street"
                          required
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-medium">Address</label>
                        <input
                          className="form-control"
                          value={address.line2}
                          onChange={(e)=>setAddress({...address,line2:e.target.value})}
                          placeholder="Landmark, Area"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowAddressForm(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Save Address</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .address-card {
          border: 1px solid #dee2e6;
          cursor: pointer;
          transition: all 0.2s;
        }
        .address-card:hover {
          border-color: #0d6efd;
          background-color: #f8f9fa;
        }
        .address-card.selected {
          border-color: #0d6efd;
          background-color: #e8f4ff;
        }
        .address-actions {
          display: none;
        }
        .address-card:hover .address-actions {
          display: block;
        }
        .modal-backdrop {
          position: fixed;
          inset: 0;
          /* THIS IS THE FIX: A much darker, more opaque background */
          background-color: rgba(0, 0, 0, 0.8);
          animation: fadeIn 180ms ease-out;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1050;
        }
        .modal.d-block { display: block; }
        .modal-content {
          border: 0;
          border-radius: 10px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.18);
          background-color: white;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .btn-close {
          background: none;
          border: none;
          font-size: 1.2rem;
          padding: 0.5rem;
        }
        .sticky-top-group {
          position: sticky;
          top: 20px;
          z-index: 100;
        }
      `}</style>
    </div>
  );
}