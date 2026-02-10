import { useState, useEffect } from 'react';
import { ordersAPI } from '../services/api';
import toast from 'react-hot-toast';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const data = await ordersAPI.getAll();
            setOrders(data);
        } catch (err) {
            toast.error('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await ordersAPI.updateStatus(id, status);
            toast.success('Order status updated');
            fetchOrders();
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    const openDetails = (order) => {
        setSelectedOrder(order);
        setShowModal(true);
    };

    const filteredOrders = orders.filter(o =>
        filter === 'ALL' || o.orderStatus === filter
    );

    if (loading) return <div className="admin-loading">Processing Orders...</div>;

    const statusOptions = ['AWAITING_PAYMENT', 'PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

    return (
        <div className="admin-orders">
            <h2 className="admin-title">Order Management</h2>

            <div className="admin-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div className="admin-tabs" style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        {['ALL', ...statusOptions].map(s => (
                            <button
                                key={s}
                                className={`admin-btn ${filter === s ? 'admin-btn--primary' : 'admin-btn--outline'}`}
                                onClick={() => setFilter(s)}
                                style={{ fontSize: '0.65rem', padding: '0.4rem 0.6rem' }}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                    <button className="admin-btn admin-btn--outline" onClick={fetchOrders}>🔄 Refresh</button>
                </div>

                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Date</th>
                                <th>Customer</th>
                                <th>Payment</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map((order) => (
                                <tr key={order._id}>
                                    <td style={{ fontWeight: '700' }}>#{order.orderId?.split('-')?.[1] || 'N/A'}</td>
                                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <div style={{ fontWeight: '500' }}>{order.customerName}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#666' }}>{order.phone}</div>
                                    </td>
                                    <td>
                                        <span className={`status-badge status-badge--${order.paymentStatus === 'PAID' ? 'success' : 'warning'}`}>
                                            {order.paymentStatus}
                                        </span>
                                        <div style={{ fontSize: '0.7rem', marginTop: '0.2rem', color: '#888' }}>{order.paymentMethod}</div>
                                    </td>
                                    <td style={{ fontWeight: '600' }}>₹{order.totalAmount.toLocaleString('en-IN')}</td>
                                    <td>
                                        <select
                                            value={order.orderStatus}
                                            onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                            style={{
                                                padding: '0.3rem',
                                                fontSize: '0.75rem',
                                                borderRadius: '4px',
                                                border: '1px solid #ddd'
                                            }}
                                        >
                                            {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    </td>
                                    <td>
                                        <button
                                            className="admin-btn admin-btn--outline"
                                            style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
                                            onClick={() => openDetails(order)}
                                        >
                                            Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Quick View Modal */}
            {showModal && selectedOrder && (
                <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()}>
                        <div className="admin-modal__header">
                            <h3 className="admin-modal__title">Order Details #{selectedOrder.orderId?.split('-')?.[1]}</h3>
                            <button className="admin-modal__close" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <div className="admin-modal__body">
                            <div className="order-detail-grid">
                                <div className="order-detail-section">
                                    <h4>Customer Information</h4>
                                    <div className="data-pair">
                                        <label>Name</label>
                                        <p>{selectedOrder.customerName}</p>
                                    </div>
                                    <div className="data-pair">
                                        <label>Phone</label>
                                        <p>{selectedOrder.phone}</p>
                                    </div>
                                    <div className="data-pair">
                                        <label>Email</label>
                                        <p>{selectedOrder.email}</p>
                                    </div>
                                </div>
                                <div className="order-detail-section">
                                    <h4>Shipping Address</h4>
                                    <p style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                                        {selectedOrder.address}<br />
                                        {selectedOrder.city}, {selectedOrder.state} - {selectedOrder.pincode}
                                    </p>
                                </div>
                            </div>

                            <div className="order-detail-section">
                                <h4>Order Items</h4>
                                <div className="order-items-list">
                                    {selectedOrder.items.map((item, idx) => (
                                        <div key={idx} className="order-item-row">
                                            <img
                                                src={item.product?.images?.[0] || 'https://via.placeholder.com/60x80'}
                                                alt=""
                                                className="order-item-img"
                                            />
                                            <div className="order-item-info">
                                                <p style={{ fontWeight: '600' }}>{item.name}</p>
                                                <span>Quantity: {item.quantity}</span>
                                            </div>
                                            <p style={{ fontWeight: '700', textAlign: 'right' }}>
                                                ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="order-detail-section" style={{ borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div className="data-pair">
                                        <label>Payment Method</label>
                                        <p>{selectedOrder.paymentMethod}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <label style={{ fontSize: '0.7rem', color: '#666', textTransform: 'uppercase' }}>Grand Total</label>
                                        <p style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--admin-accent)' }}>
                                            ₹{selectedOrder.totalAmount.toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="admin-modal__footer">
                            <button className="admin-btn admin-btn--outline" onClick={() => setShowModal(false)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
