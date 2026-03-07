/**
 * ProductDetailPage — Premium Saree Boutique Edition
 * All product details (fabric, care, shipping, style tip, etc.)
 * are driven by admin-entered data, with smart fallbacks.
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsAPI } from '../services/api';
import useCartStore from '../store/cartStore';
import useProducts from '../hooks/useProducts';
import ProductCard from '../components/ProductCard';
import SectionLoader from '../components/SectionLoader';
import toast from 'react-hot-toast';
import '../styles/product-detail.css';

// ── Accordion Item ────────────────────────────────────────────────────────────
const AccordionItem = ({ title, children, defaultOpen = false }) => {
    const [open, setOpen] = useState(defaultOpen);
    const bodyRef = useRef(null);

    return (
        <div className={`pd-accordion__item ${open ? 'is-open' : ''}`}>
            <button
                className="pd-accordion__trigger"
                onClick={() => setOpen(o => !o)}
                aria-expanded={open}
            >
                <span>{title}</span>
                <svg className="pd-accordion__icon" width="18" height="18" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9l6 6 6-6" />
                </svg>
            </button>
            <div
                className="pd-accordion__body"
                ref={bodyRef}
                style={{ maxHeight: open ? bodyRef.current?.scrollHeight + 'px' : '0' }}
            >
                <div className="pd-accordion__content">{children}</div>
            </div>
        </div>
    );
};

// ── Star Rating ───────────────────────────────────────────────────────────────
const StarRating = ({ rating = 4.8, count = 124 }) => (
    <div className="pd-rating">
        <div className="pd-rating__stars">
            {[1, 2, 3, 4, 5].map(i => (
                <svg key={i} width="14" height="14" viewBox="0 0 24 24"
                    fill={i <= Math.floor(rating) ? '#b8860b' : 'none'}
                    stroke="#b8860b" strokeWidth="1.5">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            ))}
        </div>
        <span className="pd-rating__value">{rating}</span>
        <span className="pd-rating__count">({count} reviews)</span>
        <span className="pd-rating__divider">·</span>
        <span className="pd-rating__viewers">
            <span className="pd-rating__dot"></span>
            23 people viewing right now
        </span>
    </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const addItem = useCartStore(s => s.addItem);

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [isSticky, setIsSticky] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const heroRef = useRef(null);
    const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '918780055674';

    const { products: relatedProducts } = useProducts({ limit: 5, isActive: true });

    const fetchProduct = useCallback(async () => {
        setLoading(true);
        setImageLoaded(false);
        try {
            const data = await productsAPI.getById(id);
            setProduct(data);
        } catch {
            toast.error('Product not found');
            navigate('/products');
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => { fetchProduct(); window.scrollTo(0, 0); }, [fetchProduct]);

    useEffect(() => {
        const onScroll = () => {
            if (!heroRef.current) return;
            setIsSticky(heroRef.current.getBoundingClientRect().bottom < 0);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const handleAddToCart = () => {
        addItem({ ...product, quantity });
        toast.success(`${product.name} added to bag!`, {
            style: { background: '#2d1b0e', color: '#f5e6c8', fontFamily: 'var(--ff-serif)', borderRadius: '0' },
            icon: '✨'
        });
    };

    const handleBuyNow = () => {
        addItem({ ...product, quantity });
        navigate('/checkout');
    };

    const handleWhatsApp = () => {
        const msg = encodeURIComponent(`Hi! I'm interested in: ${product?.name} (₹${product?.price?.toLocaleString()}). Link: ${window.location.href}`);
        window.open(`https://wa.me/${whatsappNumber}?text=${msg}`, '_blank');
    };

    if (loading) return <SectionLoader message="Unfolding the saree's story…" height="80vh" />;
    if (!product) return null;

    // ── Derived values ────────────────────────────────────────────────────────
    const displayPrice = product.discountedPrice || product.price;
    const hasDiscount = !!product.discountedPrice;
    const discountPct = hasDiscount
        ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
        : 0;

    const filtered = relatedProducts.filter(p => p._id !== product._id).slice(0, 4);

    // ── Smart content: admin field → auto-generated fallback ─────────────────
    const shortIntro = product.shortIntro ||
        (product.weaveType
            ? `Handwoven ${product.weaveType} saree crafted by skilled Indian artisans. A timeless piece perfect for weddings and festive celebrations.`
            : 'A timeless creation by skilled Indian artisans, crafted with heritage weaving techniques and premium quality fabric.');

    const fabricDetailsText = product.fabricDetails ||
        `Made from premium quality ${product.weaveType || 'handloom'} fabric. Each piece is handcrafted by master weavers, making it unique with slight natural variations.`;

    const careText = product.careInstructions ||
        'Dry clean recommended. If washing, use cold water with mild detergent. Avoid direct sunlight when drying. Store folded in a muslin cloth.';

    const shippingText = product.shippingInfo ||
        'Ships within 2–4 business days. Free shipping above ₹999. Easy 7-day returns for unwashed, unworn items with tags intact.';

    const detailsGrid = [
        { label: 'Fabric', value: product.fabric || product.weaveType || 'Silk Blend' },
        { label: 'Weave', value: product.weaveType || 'Handloom' },
        { label: 'Length', value: product.length || '6.3 meters' },
        { label: 'Blouse', value: product.blouseLength || '0.8 m (incl.)' },
        { label: 'Origin', value: product.origin || 'India' },
        { label: 'Stock', value: product.stock > 0 ? `${product.stock} left` : 'Sold out', highlight: product.stock <= 5 },
    ];

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="pd-page">

            {/* ── Breadcrumb ──────────────────────────────────────────────── */}
            <nav className="pd-breadcrumb" aria-label="breadcrumb">
                <button
                    className="pd-breadcrumb__back"
                    onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/products')}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5M12 5l-7 7 7 7" />
                    </svg>
                    Back
                </button>
                <div className="pd-breadcrumb__trail">
                    <span onClick={() => navigate('/')} role="button" tabIndex={0} className="pd-breadcrumb__link">Home</span>
                    <span className="pd-breadcrumb__sep">›</span>
                    <span onClick={() => navigate('/products')} role="button" tabIndex={0} className="pd-breadcrumb__link">Collection</span>
                    <span className="pd-breadcrumb__sep">›</span>
                    <span className="pd-breadcrumb__current">{product.name}</span>
                </div>
            </nav>

            {/* ── Main 2-col Layout ────────────────────────────────────────── */}
            <div className="pd-layout" ref={heroRef}>

                {/* LEFT — Gallery */}
                <div className="pd-gallery">
                    <div className={`pd-gallery__main ${imageLoaded ? 'is-loaded' : ''}`}>
                        <img
                            key={selectedImage}
                            src={product.images?.[selectedImage] || 'https://via.placeholder.com/600x800'}
                            alt={product.name}
                            className="pd-gallery__img"
                            onLoad={() => setImageLoaded(true)}
                        />
                        {hasDiscount && <div className="pd-gallery__badge">{discountPct}% OFF</div>}
                    </div>

                    {product.images?.length > 1 && (
                        <div className="pd-gallery__thumbs">
                            {product.images.map((img, idx) => (
                                <button
                                    key={idx}
                                    className={`pd-gallery__thumb ${selectedImage === idx ? 'active' : ''}`}
                                    onClick={() => { setSelectedImage(idx); setImageLoaded(false); }}
                                    aria-label={`View image ${idx + 1}`}
                                >
                                    <img src={img} alt={`View ${idx + 1}`} loading="lazy" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* RIGHT — Info */}
                <div className="pd-info">

                    <p className="pd-info__tag">{product.category?.name || 'Handloom Saree'}</p>
                    <h1 className="pd-info__title">{product.name}</h1>

                    <StarRating />

                    {/* Pricing */}
                    <div className="pd-pricing">
                        <span className="pd-pricing__current">₹{displayPrice.toLocaleString('en-IN')}</span>
                        {hasDiscount && (
                            <>
                                <span className="pd-pricing__original">₹{product.price.toLocaleString('en-IN')}</span>
                                <span className="pd-pricing__save">Save {discountPct}%</span>
                            </>
                        )}
                    </div>
                    <p className="pd-pricing__tax">Inclusive of all taxes. Free shipping above ₹999.</p>

                    {/* Short Intro (admin field or auto-generated) */}
                    <p className="pd-intro">{shortIntro}</p>

                    {/* Details Grid (all from product fields) */}
                    <div className="pd-details-grid">
                        {detailsGrid.map(d => (
                            <div key={d.label} className="pd-details-grid__item">
                                <span className="pd-details-grid__label">{d.label}</span>
                                <span className={`pd-details-grid__value ${d.highlight ? 'is-low' : ''}`}>{d.value}</span>
                            </div>
                        ))}
                    </div>

                    <hr className="pd-divider" />

                    {/* Stock badge */}
                    <div className="pd-qty-row">
                        <span className={`pd-stock-badge ${product.stock > 0 ? 'in-stock' : 'out-stock'}`}>
                            {product.stock > 0
                                ? product.stock <= 5 ? `⚡ Only ${product.stock} left!` : '✓ In Stock'
                                : '✕ Out of Stock'}
                        </span>
                    </div>

                    {/* Qty + CTA */}
                    <div className="pd-actions-row">
                        <div className="pd-qty">
                            <button className="pd-qty__btn" onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1}>−</button>
                            <span className="pd-qty__value">{quantity}</span>
                            <button className="pd-qty__btn" onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} disabled={quantity >= product.stock}>+</button>
                        </div>
                        <div className="pd-cta">
                            <button className="pd-cta__add" onClick={handleAddToCart} disabled={product.stock <= 0}>
                                {product.stock > 0 ? '🛍 Add to Bag' : 'Out of Stock'}
                            </button>
                            <button className="pd-cta__buy" onClick={handleBuyNow} disabled={product.stock <= 0}>
                                Buy Now
                            </button>
                        </div>
                    </div>

                    {/* WhatsApp inline */}
                    <button className="pd-whatsapp-inline" onClick={handleWhatsApp}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        Ask on WhatsApp
                    </button>

                    {/* Trust Badges */}
                    <div className="pd-trust">
                        {[
                            { icon: '✔', text: 'Quality Checked' },
                            { icon: '🚚', text: 'Fast Shipping' },
                            { icon: '🔒', text: 'Secure Payments' },
                            { icon: '↩', text: 'Easy Exchange' },
                            { icon: '🇮🇳', text: 'Authentic Handloom' },
                        ].map(b => (
                            <div key={b.text} className="pd-trust__badge">
                                <span className="pd-trust__icon">{b.icon}</span>
                                <span className="pd-trust__text">{b.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Accordion (all content from product fields) */}
                    <div className="pd-accordion">
                        <AccordionItem title="Product Description" defaultOpen>
                            <p>{product.description || 'No description provided.'}</p>
                        </AccordionItem>
                        <AccordionItem title="Fabric & Weave">
                            <p>{fabricDetailsText}</p>
                        </AccordionItem>
                        <AccordionItem title="Dimensions">
                            <p>
                                <strong>Saree Length:</strong> {product.length || '6.3 meters'}<br />
                                <strong>Blouse Piece:</strong> {product.blouseLength || '0.8 meters (included)'}<br />
                                <strong>Width:</strong> 47 inches
                            </p>
                        </AccordionItem>
                        <AccordionItem title="Shipping & Returns">
                            <p>{shippingText}</p>
                        </AccordionItem>
                        <AccordionItem title="Care Instructions">
                            <p>{careText}</p>
                        </AccordionItem>
                    </div>

                    {/* Style Tip — only shown when admin has entered one */}
                    {product.styleTip && (
                        <div className="pd-style-tip">
                            <span className="pd-style-tip__label">✨ Style Tip</span>
                            <p>{product.styleTip}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Related Products ─────────────────────────────────────────── */}
            {filtered.length > 0 && (
                <section className="pd-related">
                    <div className="pd-related__header">
                        <h2 className="pd-related__title">You May Also Like</h2>
                        <div className="pd-related__line"></div>
                    </div>
                    <div className="pd-related__grid">
                        {filtered.map(p => <ProductCard key={p._id} product={p} />)}
                    </div>
                </section>
            )}

            {/* ── Sticky Mobile Bar ────────────────────────────────────────── */}
            <div className={`pd-sticky ${isSticky ? 'is-visible' : ''}`}>
                <div className="pd-sticky__price">₹{displayPrice.toLocaleString('en-IN')}</div>
                <button className="pd-sticky__add" onClick={handleAddToCart} disabled={product.stock <= 0}>
                    {product.stock > 0 ? 'Add to Bag' : 'Out of Stock'}
                </button>
                <button className="pd-sticky__buy" onClick={handleBuyNow} disabled={product.stock <= 0}>
                    Buy Now
                </button>
            </div>

            {/* ── WhatsApp Float ───────────────────────────────────────────── */}
            <button className="pd-wa-float" onClick={handleWhatsApp} aria-label="WhatsApp Enquiry">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
            </button>
        </div>
    );
};

export default ProductDetailPage;
