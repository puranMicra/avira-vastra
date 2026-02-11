/**
 * Shopping Cart Page
 * Manage items, quantities, and proceed to checkout
 */

import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import useCartStore from '../store/cartStore';
import FullPageLoader from '../components/FullPageLoader';
import '../styles/cart.css';

const CartPage = () => {
    const navigate = useNavigate();
    const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();
    const [actionLoading, setActionLoading] = useState(false);

    const handleUpdateQuantity = (id, q) => {
        setActionLoading(true);
        setTimeout(() => {
            updateQuantity(id, q);
            setActionLoading(false);
        }, 600);
    };

    const handleRemoveItem = (id) => {
        setActionLoading(true);
        setTimeout(() => {
            removeItem(id);
            setActionLoading(false);
        }, 600);
    };

    const subtotal = getTotal();
    const shipping = 0; // Free shipping for now
    const total = subtotal + shipping;

    if (items.length === 0) {
        return (
            <div className="cart-empty">
                <div className="cart-empty__content">
                    <svg className="cart-empty__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                    <h1 className="cart-empty__title">Your bag is empty</h1>
                    <p className="cart-empty__text">Looks like you haven't added anything to your bag yet.</p>
                    <Link to="/products" className="cart-empty__button">
                        Start Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page">
            {actionLoading && <FullPageLoader message="Updating Bag..." />}
            <div className="cart-container">
                <h1 className="cart-title">Shopping Bag ({items.length})</h1>

                <div className="cart-layout">
                    {/* Items List */}
                    <div className="cart-items">
                        {items.map((item) => (
                            <div key={item._id} className="cart-item">
                                <Link to={`/product/${item._id}`} className="cart-item__image-link">
                                    <img
                                        src={item.images?.[0] || 'https://via.placeholder.com/150'}
                                        alt={item.name}
                                        className="cart-item__image"
                                    />
                                </Link>

                                <div className="cart-item__details">
                                    <div className="cart-item__header">
                                        <h3 className="cart-item__name">
                                            <Link to={`/product/${item._id}`}>{item.name}</Link>
                                        </h3>
                                        <div className="cart-item__price-group">
                                            {item.discountedPrice ? (
                                                <>
                                                    <span className="cart-item__price discounted">₹{item.discountedPrice.toLocaleString()}</span>
                                                    <span className="cart-item__price-original">₹{item.price.toLocaleString()}</span>
                                                </>
                                            ) : (
                                                <span className="cart-item__price">₹{item.price.toLocaleString()}</span>
                                            )}
                                        </div>
                                    </div>

                                    <p className="cart-item__category">{item.category?.name || 'Saree'}</p>

                                    <div className="cart-item__actions">
                                        <div className="premium-qty">
                                            <button
                                                onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                                                className="qty-trigger"
                                                disabled={item.quantity <= 1}
                                                aria-label="Decrease quantity"
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                    <line x1="5" y1="12" x2="19" y2="12" />
                                                </svg>
                                            </button>
                                            <span className="qty-display">{item.quantity}</span>
                                            <button
                                                onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                                                className="qty-trigger"
                                                aria-label="Increase quantity"
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                    <line x1="12" y1="5" x2="12" y2="19" />
                                                    <line x1="5" y1="12" x2="19" y2="12" />
                                                </svg>
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => handleRemoveItem(item._id)}
                                            className="cart-item__remove"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button onClick={clearCart} className="cart-clear-btn">
                            Clear Bag
                        </button>
                    </div>

                    {/* Order Summary */}
                    <div className="cart-summary">
                        <div className="summary-card">
                            <h2 className="summary-title">Order Summary</h2>

                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span>₹{subtotal.toLocaleString()}</span>
                            </div>

                            <div className="summary-row">
                                <span>Shipping</span>
                                <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                            </div>

                            <div className="summary-divider"></div>

                            <div className="summary-row summary-total">
                                <span>Total</span>
                                <span>₹{total.toLocaleString()}</span>
                            </div>

                            <p className="summary-tax-text">Including GST and all taxes</p>

                            <button
                                onClick={() => navigate('/checkout')}
                                className="checkout-button"
                            >
                                Proceed to Checkout
                            </button>

                            <div className="payment-icons">
                                <span className="payment-label">Secure Payment via Razorpay</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
