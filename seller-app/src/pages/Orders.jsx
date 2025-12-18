// seller-app/src/pages/Orders.jsx
import { useEffect, useMemo, useState } from "react";
import { orderService } from "../services/orderService";
import { flagService } from "../services/flagService";
import "./Orders.css";

const STATUS_OPTIONS = ["pending", "processing", "shipped", "delivered", "cancelled"];

const STATUS_CONFIG = {
  pending: { icon: "⏳", color: "#f59e0b", label: "Pending" },
  processing: { icon: "⚙️", color: "#3b82f6", label: "Processing" },
  shipped: { icon: "🚚", color: "#8b5cf6", label: "Shipped" },
  delivered: { icon: "✅", color: "#10b981", label: "Delivered" },
  cancelled: { icon: "❌", color: "#ef4444", label: "Cancelled" },
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState("");
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [flaggingOrder, setFlaggingOrder] = useState(null);
  const [flagReason, setFlagReason] = useState("");
  const [flagSubmitting, setFlagSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadOrders = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await orderService.getSellerOrders(statusFilter);
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || "Failed to load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const emptyText = useMemo(() => {
    if (loading) return "Loading...";
    if (statusFilter) return `No orders with status "${statusFilter}".`;
    return "No orders yet.";
  }, [loading, statusFilter]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    setError("");

    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      await loadOrders();
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || "Failed to update order status");
    } finally {
      setUpdatingId("");
    }
  };

  const openFlagModal = (order) => {
    setFlaggingOrder(order);
    setFlagReason("");
    setFlagModalOpen(true);
    setError("");
  };

  const closeFlagModal = () => {
    setFlagModalOpen(false);
    setFlaggingOrder(null);
    setFlagReason("");
  };

  const handleFlagSubmit = async (e) => {
    e.preventDefault();
    
    const orderId = flaggingOrder?._id || flaggingOrder?.id;
    const buyerId = flaggingOrder?.buyer?._id || flaggingOrder?.buyer?.id || 
                    flaggingOrder?.buyerId || flaggingOrder?.buyer;

    if (!buyerId) {
      setError("Cannot flag buyer: buyerId not found on this order.");
      return;
    }

    if (!flagReason.trim()) {
      setError("Please provide a reason for flagging.");
      return;
    }

    setFlagSubmitting(true);
    setError("");

    try {
      await flagService.flagBuyer({ buyerId, reason: flagReason.trim(), orderId });
      closeFlagModal();
      alert("Buyer flagged successfully.");
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || "Failed to flag buyer");
    } finally {
      setFlagSubmitting(false);
    }
  };

  return (
    <div className="orders-page">
      <div className="orders-header">
        <div>
          <h1>Orders Management</h1>
          <p className="orders-subtitle">Track and manage your customer orders</p>
        </div>

        <div className="orders-controls">
          <select 
            className="filter-select"
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {STATUS_CONFIG[s]?.icon} {STATUS_CONFIG[s]?.label}
              </option>
            ))}
          </select>

          <button className="refresh-btn" onClick={loadOrders} disabled={loading}>
            {loading ? "🔄 Refreshing..." : "🔄 Refresh"}
          </button>
        </div>
      </div>

      {error && <div className="orders-error">{error}</div>}

      {orders.length === 0 ? (
        <div className="empty-orders">
          <div className="empty-icon">📦</div>
          <h3>No orders found</h3>
          <p>{emptyText}</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((o) => {
            const id = o._id || o.id;
            const buyerName = o?.buyer?.name || o?.buyerName || "Buyer";
            const buyerEmail = o?.buyer?.email || "";
            const statusInfo = STATUS_CONFIG[o.status] || STATUS_CONFIG.pending;

            return (
              <div key={id} className="order-card">
                <div className="order-header">
                  <div className="order-id-section">
                    <span className="order-id">#{id.slice(-8)}</span>
                    <span className={`status-badge status-${o.status}`}>
                      <span className="status-icon">{statusInfo.icon}</span>
                      <span>{statusInfo.label}</span>
                    </span>
                  </div>
                  
                  <div className="order-total">${o.total?.toFixed(2) || '0.00'}</div>
                </div>

                <div className="order-info">
                  <div className="info-item">
                    <span className="info-icon">👤</span>
                    <div>
                      <div className="info-label">Customer</div>
                      <div className="info-value">{buyerName}</div>
                      {buyerEmail && <div className="info-email">{buyerEmail}</div>}
                    </div>
                  </div>

                  {o.createdAt && (
                    <div className="info-item">
                      <span className="info-icon">📅</span>
                      <div>
                        <div className="info-label">Order Date</div>
                        <div className="info-value">
                          {new Date(o.createdAt).toLocaleDateString()}
                        </div>
                        <div className="info-time">
                          {new Date(o.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="order-actions">
                  <div className="status-dropdown-wrapper">
                    <label className="dropdown-label">Update Status:</label>
                    <select
                      className="status-select"
                      value={o.status || ""}
                      onChange={(e) => handleStatusChange(id, e.target.value)}
                      disabled={updatingId === id}
                    >
                      {STATUS_OPTIONS.map((s) => {
                        const config = STATUS_CONFIG[s];
                        return (
                          <option key={s} value={s}>
                            {config.icon} {config.label}
                          </option>
                        );
                      })}
                    </select>
                    {updatingId === id && <span className="updating-spinner">⏳</span>}
                  </div>

                  <button
                    className="flag-btn"
                    onClick={() => openFlagModal(o)}
                    title="Report buyer"
                  >
                    🚩 Flag Buyer
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Flag Modal */}
      {flagModalOpen && (
        <div className="modal-overlay" onClick={closeFlagModal}>
          <div className="modal flag-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <div>
                <h2>🚩 Flag Buyer</h2>
                <p className="modal__subtitle">
                  Report {flaggingOrder?.buyer?.name || "this buyer"} for inappropriate behavior
                </p>
              </div>
              <button className="modal__close" onClick={closeFlagModal}>
                ✕
              </button>
            </div>

            {error && <div className="modal__error">{error}</div>}

            <form onSubmit={handleFlagSubmit} className="modal__body">
              <div className="flag-info">
                <div className="flag-info-item">
                  <strong>Order ID:</strong> {flaggingOrder?._id?.slice(-8)}
                </div>
                <div className="flag-info-item">
                  <strong>Buyer:</strong> {flaggingOrder?.buyer?.name}
                </div>
                {flaggingOrder?.buyer?.email && (
                  <div className="flag-info-item">
                    <strong>Email:</strong> {flaggingOrder.buyer.email}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Reason for flagging <span className="required">*</span>
                </label>
                <textarea
                  className="form-textarea"
                  value={flagReason}
                  onChange={(e) => setFlagReason(e.target.value)}
                  placeholder="Please describe the reason for flagging this buyer (e.g., fraudulent activity, abusive behavior, payment issues)..."
                  rows="5"
                  required
                />
              </div>

              <div className="modal__footer">
                <button type="button" className="btn btn-secondary" onClick={closeFlagModal}>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-danger" 
                  disabled={flagSubmitting || !flagReason.trim()}
                >
                  {flagSubmitting ? "Submitting..." : "Submit Flag"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
