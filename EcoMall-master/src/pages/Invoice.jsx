import React from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';

export default function Invoice() {
  const { orderId } = useParams();
  const location = useLocation();
  const data = location.state || {};

  const {
    booked_reference,
    payment_id,
    items = [],
    subtotal = 0,
    gstRate = 0,
    gstAmount = 0,
    platformFee = 0,
    deliveryFee = 0,
    total = 0,
    customer = {},
    address = {}
  } = data;

  const fmt = (n) => `₹${Number(n || 0).toFixed(2)}`;

  const handleDownload = async () => {
    const id = orderId || data.order_id;
    if (!id) return;
    try {
      const res = await fetch(`/EcoMall/invoice/${id}/pdf/`, {
        method: 'GET',
        headers: { 'Accept': 'application/pdf' }
      });
      if (!res.ok) throw new Error('Failed to download');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Invoice download failed', e);
    }
  };

  return (
    <div className="container my-5">
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card shadow-sm mb-4">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between flex-wrap mb-3">
                <div>
                  <div className="h5 fw-bold">Eco Mall</div>
                  <div className="text-muted small">Order ID: {orderId}</div>
                  {booked_reference && (
                    <div className="text-muted small">Reference: {booked_reference}</div>
                  )}
                  {payment_id && (
                    <div className="text-muted small">Payment ID: {payment_id}</div>
                  )}
                </div>
                <div className="text-end">
                  <div className="small text-muted">Date</div>
                  <div>{new Date().toLocaleString()}</div>
                </div>
              </div>

              <hr />

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <div className="fw-semibold mb-1">Billed To</div>
                  <div>{customer?.name || '-'}</div>
                  <div className="text-muted small">{customer?.email || ''}</div>
                  <div className="text-muted small">{customer?.phone || ''}</div>
                </div>
                <div className="col-md-6">
                  <div className="fw-semibold mb-1">Delivery Address</div>
                  <div>{address?.line1 || '-'}</div>
                  {address?.line2 ? <div>{address.line2}</div> : null}
                  <div>{[address?.city, address?.state, address?.pincode].filter(Boolean).join(', ')}</div>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table align-middle">
                  <thead className="table-light">
                    <tr>
                      <th style={{width: '50%'}}>Item</th>
                      <th className="text-center">Qty</th>
                      <th className="text-end">Unit Price</th>
                      <th className="text-end">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it, idx) => (
                      <tr key={idx}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            {it.image ? (
                              <img src={it.image} alt={it.title} style={{width: 40, height: 40, objectFit: 'contain'}} />
                            ) : null}
                            <div>
                              <div className="fw-semibold">{it.title || it.item_name || `Item #${it.item_id}`}</div>
                              {it.subtitle ? <div className="small text-muted">{it.subtitle}</div> : null}
                            </div>
                          </div>
                        </td>
                        <td className="text-center">{it.quantity || 1}</td>
                        <td className="text-end">{fmt(it.price)}</td>
                        <td className="text-end">{fmt((it.quantity || 1) * (it.price || 0))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="row justify-content-end">
                <div className="col-md-6">
                  <div className="d-flex justify-content-between mb-2">
                    <div className="text-muted">Subtotal</div>
                    <div>{fmt(subtotal)}</div>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <div className="text-muted">GST ({Math.round((gstRate||0)*100)}%)</div>
                    <div>{fmt(gstAmount)}</div>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <div className="text-muted">Platform Fee</div>
                    <div>{fmt(platformFee)}</div>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <div className="text-muted">Delivery Fee</div>
                    <div>{deliveryFee ? fmt(deliveryFee) : <span className="text-success">FREE</span>}</div>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between fw-bold fs-5">
                    <div>Total</div>
                    <div>{fmt(total)}</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 small text-muted">
                This is a computer-generated invoice and does not require a signature.
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          {/* Download Invoice Card */}
          <div className="card shadow-sm mb-4">
            <div className="card-body p-4 text-center">
              <div className="mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" className="bi bi-file-earmark-text text-primary" viewBox="0 0 16 16">
                  <path d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5z"/>
                  <path d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5L9.5 0zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z"/>
                </svg>
              </div>
              <h5 className="card-title mb-3">Download Invoice</h5>
              <button className="btn btn-success w-100" onClick={handleDownload}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-download me-2" viewBox="0 0 16 16">
                  <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                  <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                </svg>
                Download Invoice (PDF)
              </button>
            </div>
          </div>

          {/* Thanks Card */}
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <div className="fw-semibold mb-2">Thanks for your purchase! 🎉</div>
              <div className="text-muted small">Save this invoice for your records and track your order from your account.</div>
              <hr />
              <div className="d-flex flex-column gap-2">
                <Link to="/" className="btn btn-outline-primary">Go to Home</Link>
                <Link to="/wishlist" className="btn btn-outline-secondary">Browse Wishlist</Link>
              </div>
            </div>
          </div>     
        </div>
      </div>
    </div>
  );
}