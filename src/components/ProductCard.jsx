import { Link } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import toast from 'react-hot-toast';
import './ProductCard.css';

/**
 * ProductCard Component 
 * Ultra-Luxury Boutique Edition
 */
const ProductCard = ({ product }) => {
    const addItem = useCartStore((state) => state.addItem);

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addItem(product);
        toast.success(`${product.name} added to bag`, {
            style: {
                background: '#3d2b1f',
                color: '#fff',
                fontFamily: 'var(--font-serif)',
                borderRadius: '0px',
                fontSize: '0.8rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase'
            },
            icon: '✨'
        });
    };

    const price = product.discountedPrice || product.price;
    const hasDiscount = !!product.discountedPrice;
    const discountPercentage = hasDiscount
        ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
        : 0;

    return (
        <div className="avira-boutique-card">
            <Link to={`/product/${product._id}`} className="abc-link">
                <div className="abc-image-box">
                    <img
                        src={product.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80'}
                        alt={product.name}
                        className="abc-image"
                        loading="lazy"
                    />

                    {hasDiscount && (
                        <div className="abc-badge">
                            {discountPercentage}% Off
                        </div>
                    )}
                </div>

                <div className="abc-details">
                    <span className="abc-label">
                        {product.occasion || 'Authentic Weave'}
                    </span>

                    <h3 className="abc-name">
                        {product.name}
                    </h3>

                    <div className="abc-price-wrap">
                        {hasDiscount && (
                            <span className="abc-price-old">
                                ₹{product.price.toLocaleString('en-IN')}
                            </span>
                        )}
                        <span className="abc-price-current">
                            ₹{price.toLocaleString('en-IN')}
                        </span>
                    </div>

                    {/* Premium Action Button - Replaces the floating icon */}
                    <button
                        className="abc-add-btn"
                        onClick={handleAddToCart}
                        aria-label="Add to Bag"
                    >
                        <span>Add to Bag</span>
                    </button>
                </div>
            </Link>
        </div>
    );
};

export default ProductCard;
