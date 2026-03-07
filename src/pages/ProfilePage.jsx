/**
 * Profile Page (Premium Re-design)
 * User dashboard for managing account and orders
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { authAPI, ordersAPI } from '../services/api';
import FullPageLoader from '../components/FullPageLoader';
import SectionLoader from '../components/SectionLoader';
import toast from 'react-hot-toast';
import '../styles/profile.css';

const ProfilePage = () => {
    const navigate = useNavigate();
    const { user, logout, updateUser, isAuthenticated } = useAuthStore();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const [orderLoading, setOrderLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        address: {
            street: user?.address?.street || '',
            city: user?.address?.city || '',
            state: user?.address?.state || '',
            pincode: user?.address?.pincode || '',
        }
    });

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        const fetchProfileData = async () => {
            try {
                const profileData = await authAPI.getCustomerProfile();
                updateUser(profileData);
                setFormData({
                    name: profileData.name,
                    phone: profileData.phone || '',
                    address: {
                        street: profileData.address?.street || '',
                        city: profileData.address?.city || '',
                        state: profileData.address?.state || '',
                        pincode: profileData.address?.pincode || '',
                    }
                });

                // Fetch Orders
                try {
                    const orderData = await ordersAPI.getMyOrders();
                    setOrders(orderData?.orders ?? (Array.isArray(orderData) ? orderData : []));
                } catch (err) {
                    console.error('Error fetching orders:', err);
                } finally {
                    setOrderLoading(false);
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [isAuthenticated, navigate, updateUser]);

    const handleLogout = () => {
        setActionLoading(true);
        setTimeout(() => {
            logout();
            toast.success('Logged out successfully');
            navigate('/');
        }, 1000);
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            setActionLoading(true);
            const updated = await authAPI.updateCustomerProfile(formData);
            updateUser(updated);
            setIsEditing(false);
            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error(error.message || 'Update failed');
        } finally {
            setActionLoading(false);
        }
    };

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            address: {
                ...prev.address,
                [name]: value
            }
        }));
    };

    if (loading) {
        return <SectionLoader message="Opening your personalized vault..." height="70vh" />;
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'DELIVERED': return '#4CAF50';
            case 'PLACED': return '#2196F3';
            case 'SHIPPED': return '#FF9800';
            case 'CANCELLED': return '#F44336';
            default: return '#9E9E9E';
        }
    };

    const hasAddress = user?.address?.street && user?.address?.city;

    return (
        <div className="profile-page">
            {actionLoading && <FullPageLoader message="Verifying Updates..." />}
            <div className="profile-container">
                {/* Account Header */}
                <header className="account-hero">
                    <div className="account-hero__info">
                        <div className="account-hero__avatar">
                            {user.avatar ? (
                                <img src={user.avatar} alt={user.name} />
                            ) : (
                                <div className="avatar-placeholder">{user.name?.charAt(0)}</div>
                            )}
                        </div>
                        <div className="account-hero__text">
                            <h1 className="account-hero__name">{user.name}</h1>
                            <p className="account-hero__email">{user.email}</p>
                            <span className="account-hero__badge">Premium Member</span>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="account-hero__logout">
                        Sign Out
                    </button>
                </header>

                <div className="account-layout">
                    {/* Sidebar Tabs */}
                    <aside className="account-sidebar">
                        <button
                            className={`account-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('dashboard'); setIsEditing(false); }}
                        >
                            <span className="icon">👤</span> Account Details
                        </button>
                        <button
                            className={`account-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('orders'); setIsEditing(false); }}
                        >
                            <span className="icon">🛍️</span> My Orders
                        </button>
                        <button
                            className={`account-nav-item ${activeTab === 'addresses' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('addresses'); setIsEditing(false); }}
                        >
                            <span className="icon">📍</span> Shipping Address
                        </button>
                    </aside>

                    {/* Content Area */}
                    <main className="account-content">
                        {activeTab === 'dashboard' && (
                            <section className="account-card">
                                <div className="account-card__header">
                                    <h2 className="account-card__title">Personal Information</h2>
                                    <button
                                        className="account-card__edit-btn"
                                        onClick={() => setIsEditing(!isEditing)}
                                    >
                                        {isEditing ? 'Cancel' : 'Edit Profile'}
                                    </button>
                                </div>

                                {isEditing ? (
                                    <form onSubmit={handleUpdateProfile} className="account-form">
                                        <div className="account-form__group">
                                            <label>Full Name</label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="Your Name"
                                                required
                                            />
                                        </div>
                                        <div className="account-form__group">
                                            <label>Email Address</label>
                                            <input type="email" value={user.email} disabled />
                                            <small>Your email is managed by your Google Account.</small>
                                        </div>
                                        <div className="account-form__group">
                                            <label>Phone Number</label>
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                placeholder="+91 XXXXX XXXXX"
                                            />
                                        </div>
                                        <button type="submit" className="account-form__submit">
                                            Save Changes
                                        </button>
                                    </form>
                                ) : (
                                    <div className="account-info-grid">
                                        <div className="info-item">
                                            <label>Full Name</label>
                                            <p>{user.name}</p>
                                        </div>
                                        <div className="info-item">
                                            <label>Email Address</label>
                                            <p>{user.email}</p>
                                        </div>
                                        <div className="info-item">
                                            <label>Phone Number</label>
                                            <p>{user.phone || 'Not provided yet'}</p>
                                        </div>
                                        <div className="info-item">
                                            <label>Member Since</label>
                                            <p>{new Date(user.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
                                        </div>
                                    </div>
                                )}
                            </section>
                        )}

                        {activeTab === 'orders' && (
                            <section className="account-card">
                                <h2 className="account-card__title">Order History</h2>
                                {orderLoading ? (
                                    <SectionLoader message="Syncing your fashion history..." height="200px" />
                                ) : orders.length > 0 ? (
                                    <div className="order-history-list">
                                        {orders.map((order) => (
                                            <div key={order._id} className="order-item-card">
                                                <div className="order-item-card__header">
                                                    <div>
                                                        <span className="order-id">#{order.orderId}</span>
                                                        <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <span
                                                        className="order-status-badge"
                                                        style={{ backgroundColor: `${getStatusColor(order.orderStatus)}20`, color: getStatusColor(order.orderStatus) }}
                                                    >
                                                        {order.orderStatus}
                                                    </span>
                                                </div>
                                                <div className="order-item-card__content">
                                                    <div className="order-summary">
                                                        <p><strong>Total:</strong> ₹{order.totalAmount.toLocaleString()}</p>
                                                        <p><strong>Items:</strong> {order.items.length}</p>
                                                    </div>
                                                    <button onClick={() => navigate(`/order-success/${order._id}`)} className="view-order-btn">
                                                        View Details
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="empty-state">
                                        <div className="empty-state__icon">📦</div>
                                        <p className="empty-state__text">You haven't placed any orders yet.</p>
                                        <button onClick={() => navigate('/products')} className="empty-state__btn">
                                            Browse Our Collection
                                        </button>
                                    </div>
                                )}
                            </section>
                        )}

                        {activeTab === 'addresses' && (
                            <section className="account-card">
                                <div className="account-card__header">
                                    <h2 className="account-card__title">Shipping Address</h2>
                                    {(hasAddress && !isEditing) && (
                                        <button
                                            className="account-card__edit-btn"
                                            onClick={() => setIsEditing(true)}
                                        >
                                            Edit Address
                                        </button>
                                    )}
                                </div>

                                {(!hasAddress || isEditing) ? (
                                    <form onSubmit={handleUpdateProfile} className="account-form">
                                        <div className="account-form__group">
                                            <label>Street / Area</label>
                                            <input
                                                name="street"
                                                type="text"
                                                value={formData.address.street}
                                                onChange={handleAddressChange}
                                                placeholder="Flat/House No, Street, Area"
                                                required
                                            />
                                        </div>
                                        <div className="account-form__row">
                                            <div className="account-form__group">
                                                <label>City</label>
                                                <input
                                                    name="city"
                                                    type="text"
                                                    value={formData.address.city}
                                                    onChange={handleAddressChange}
                                                    placeholder="City"
                                                    required
                                                />
                                            </div>
                                            <div className="account-form__group">
                                                <label>Pincode</label>
                                                <input
                                                    name="pincode"
                                                    type="text"
                                                    value={formData.address.pincode}
                                                    onChange={handleAddressChange}
                                                    placeholder="6-digit ZIP"
                                                    maxLength="6"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="account-form__group">
                                            <label>State</label>
                                            <input
                                                name="state"
                                                type="text"
                                                value={formData.address.state}
                                                onChange={handleAddressChange}
                                                placeholder="State"
                                                required
                                            />
                                        </div>
                                        <div className="account-form__actions">
                                            <button type="submit" className="account-form__submit">
                                                {hasAddress ? 'Update Address' : 'Save Address'}
                                            </button>
                                            {isEditing && (
                                                <button
                                                    type="button"
                                                    className="account-form__cancel"
                                                    onClick={() => setIsEditing(false)}
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </div>
                                    </form>
                                ) : (
                                    <div className="address-display">
                                        <div className="address-display__card">
                                            <p className="address-display__text"><strong>Street:</strong> {user.address.street}</p>
                                            <p className="address-display__text"><strong>City:</strong> {user.address.city}</p>
                                            <p className="address-display__text"><strong>State:</strong> {user.address.state}</p>
                                            <p className="address-display__text"><strong>Pincode:</strong> {user.address.pincode}</p>
                                            <div className="address-display__meta">
                                                <span>✔️ Primary Shipping Address</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </section>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
