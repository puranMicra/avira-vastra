import { useState, useEffect } from 'react';
import { productsAPI, categoriesAPI, occasionsAPI, collectionsAPI, uploadAPI } from '../services/api';
import SectionLoader from '../components/SectionLoader';
import toast from 'react-hot-toast';

// ── Empty form state (single source of truth) ─────────────────────────────────
const EMPTY_FORM = {
    name: '',
    description: '',
    shortIntro: '',
    price: '',
    discountedPrice: '',
    category: '',
    weaveType: '',
    fabric: '',
    length: '6.3 meters',
    blouseLength: '0.8 meters (included)',
    origin: 'India',
    stock: 1,
    isActive: true,
    occasions: [],
    collections: [],
    images: [],
    styleTip: '',
    careInstructions: '',
    shippingInfo: '',
    fabricDetails: '',
};

// ── Collapsible section for the form ─────────────────────────────────────────
const FormSection = ({ title, children, defaultOpen = true }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.5rem' }}>
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                style={{
                    width: '100%', display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', padding: '0.85rem 1.25rem', background: '#f8fafc',
                    border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem',
                    color: '#1e293b', letterSpacing: '0.02em'
                }}
            >
                {title}
                <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>{open ? '−' : '+'}</span>
            </button>
            {open && <div style={{ padding: '1.25rem' }}>{children}</div>}
        </div>
    );
};

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [occasions, setOccasions] = useState([]);
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState(EMPTY_FORM);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [pData, cData, oData, colData] = await Promise.all([
                productsAPI.getAll(),
                categoriesAPI.getAll(),
                occasionsAPI.getAll(),
                collectionsAPI.getAll()
            ]);
            setProducts(pData?.products ?? (Array.isArray(pData) ? pData : []));
            setCategories(cData);
            setOccasions(oData);
            setCollections(colData);
        } catch {
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const set = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            ...EMPTY_FORM,
            ...product,
            price: product.price.toString(),
            discountedPrice: product.discountedPrice?.toString() || '',
            stock: Math.max(0, product.stock).toString(),
            category: product.category?._id || product.category,
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await productsAPI.delete(id);
                toast.success('Product deleted');
                fetchData();
            } catch {
                toast.error('Failed to delete product');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const submissionData = {
            ...formData,
            price: Math.max(0, Number(formData.price)),
            discountedPrice: formData.discountedPrice ? Math.max(0, Number(formData.discountedPrice)) : undefined,
            stock: Math.max(0, Number(formData.stock)),
        };
        try {
            if (editingProduct) {
                await productsAPI.update(editingProduct._id, submissionData);
                toast.success('Product updated successfully');
            } else {
                await productsAPI.create(submissionData);
                toast.success('New product added to collection');
            }
            setShowForm(false);
            setEditingProduct(null);
            setFormData(EMPTY_FORM);
            fetchData();
        } catch (err) {
            toast.error(err.message || 'Operation failed');
        }
    };

    const handleTaxonomyChange = (type, id) => {
        const current = [...formData[type]];
        const idx = current.indexOf(id);
        if (idx > -1) current.splice(idx, 1);
        else current.push(id);
        setFormData(prev => ({ ...prev, [type]: current }));
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        const loadingToast = toast.loading('Uploading images...');
        try {
            const results = await Promise.all(files.map(file => {
                const fd = new FormData();
                fd.append('image', file);
                return uploadAPI.uploadImage(fd);
            }));
            const newUrls = results.map(r => r.url);
            setFormData(prev => ({ ...prev, images: [...prev.images, ...newUrls] }));
            toast.success('Images uploaded', { id: loadingToast });
        } catch {
            toast.error('Failed to upload images', { id: loadingToast });
        }
    };

    const removeImage = (index) => {
        const imgs = [...formData.images];
        imgs.splice(index, 1);
        setFormData(prev => ({ ...prev, images: imgs }));
    };

    if (loading) return <SectionLoader message="Opening the master inventory..." height="60vh" />;

    // ── Input helpers ────────────────────────────────────────────────────────
    const Field = ({ label, hint, children }) => (
        <div className="form-group">
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <span style={{ fontWeight: 600, fontSize: '0.82rem', color: '#374151' }}>{label}</span>
                {hint && <span style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 400 }}>{hint}</span>}
            </label>
            {children}
        </div>
    );

    return (
        <div className="admin-products">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 className="admin-title">Product Management</h2>
                {!showForm && (
                    <button className="admin-btn admin-btn--primary" onClick={() => {
                        setEditingProduct(null);
                        setFormData(EMPTY_FORM);
                        setShowForm(true);
                    }}>
                        + Add New Product
                    </button>
                )}
            </div>

            {showForm ? (
                <div className="admin-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0 }}>{editingProduct ? '✏️ Edit Product' : '➕ Add New Saree'}</h3>
                        <button className="admin-btn admin-btn--outline" onClick={() => { setShowForm(false); setEditingProduct(null); }}>
                            ← Back to List
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>

                        {/* ── SECTION 1: Basic Info ─────────────────────────── */}
                        <FormSection title="📦 Basic Information" defaultOpen>
                            <div className="form-grid">
                                <Field label="Product Name *">
                                    <input
                                        type="text" value={formData.name} required
                                        onChange={e => set('name', e.target.value)}
                                        placeholder="e.g. Kanjivaram Silk Saree – Bridal Red"
                                    />
                                </Field>
                                <Field label="Category *">
                                    <select value={formData.category} required onChange={e => set('category', e.target.value)}>
                                        <option value="">Select Category</option>
                                        {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                    </select>
                                </Field>
                                <Field label="Base Price (₹) *">
                                    <input type="number" min="0" value={formData.price} required onChange={e => set('price', e.target.value)} placeholder="0" />
                                </Field>
                                <Field label="Discounted / Sale Price (₹)" hint="Leave blank if no discount">
                                    <input type="number" min="0" value={formData.discountedPrice} onChange={e => set('discountedPrice', e.target.value)} placeholder="0" />
                                </Field>
                                <Field label="Stock Quantity *">
                                    <input type="number" min="0" value={formData.stock} required onChange={e => set('stock', e.target.value)} />
                                </Field>
                                <Field label="Status">
                                    <select value={formData.isActive} onChange={e => set('isActive', e.target.value === 'true')}>
                                        <option value="true">Active (Visible)</option>
                                        <option value="false">Inactive (Hidden)</option>
                                    </select>
                                </Field>
                            </div>
                        </FormSection>

                        {/* ── SECTION 2: Images ────────────────────────────── */}
                        <FormSection title="🖼️ Product Images">
                            <input
                                type="file" multiple accept="image/*"
                                onChange={handleImageUpload}
                                className="admin-file-input"
                                style={{ marginBottom: '1rem', display: 'block' }}
                            />
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '0.75rem' }}>
                                {formData.images.map((url, idx) => (
                                    <div key={idx} style={{ position: 'relative', height: '110px', borderRadius: '6px', overflow: 'hidden' }}>
                                        <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <button
                                            type="button" onClick={() => removeImage(idx)}
                                            style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(220,38,38,0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', fontSize: '11px', fontWeight: 700 }}
                                        >✕</button>
                                    </div>
                                ))}
                            </div>
                        </FormSection>

                        {/* ── SECTION 3: Descriptions ──────────────────────── */}
                        <FormSection title="📝 Descriptions">
                            <Field label="Short Intro" hint="2–3 line artisan story shown just below the price (italic text on product page)">
                                <textarea
                                    rows="2" value={formData.shortIntro}
                                    onChange={e => set('shortIntro', e.target.value)}
                                    placeholder="e.g. Handwoven Pochampally Ikat silk crafted by Telangana artisans. A timeless saree perfect for weddings and festive celebrations."
                                />
                            </Field>
                            <Field label="Full Product Description *" hint="Shown in the accordion 'Product Description' section">
                                <textarea
                                    rows="5" value={formData.description} required
                                    onChange={e => set('description', e.target.value)}
                                    placeholder="Detailed product description..."
                                />
                            </Field>
                        </FormSection>

                        {/* ── SECTION 4: Saree Details ─────────────────────── */}
                        <FormSection title="🧵 Saree Details (shown in product details grid)">
                            <div className="form-grid">
                                <Field label="Weave Type" hint="e.g. Kanjivaram, Banarasi, Paithani">
                                    <input type="text" value={formData.weaveType} onChange={e => set('weaveType', e.target.value)} placeholder="e.g. Kanjivaram" />
                                </Field>
                                <Field label="Fabric" hint="e.g. Pure Silk, Cotton Silk, Organza">
                                    <input type="text" value={formData.fabric} onChange={e => set('fabric', e.target.value)} placeholder="e.g. Pure Silk" />
                                </Field>
                                <Field label="Saree Length" hint="Default: 6.3 meters">
                                    <input type="text" value={formData.length} onChange={e => set('length', e.target.value)} placeholder="6.3 meters" />
                                </Field>
                                <Field label="Blouse Piece" hint="Default: 0.8 meters (included)">
                                    <input type="text" value={formData.blouseLength} onChange={e => set('blouseLength', e.target.value)} placeholder="0.8 meters (included)" />
                                </Field>
                                <Field label="Origin / Region" hint="e.g. Kanchipuram, Tamil Nadu">
                                    <input type="text" value={formData.origin} onChange={e => set('origin', e.target.value)} placeholder="e.g. Kanchipuram" />
                                </Field>
                            </div>
                        </FormSection>

                        {/* ── SECTION 5: Accordion Content ─────────────────── */}
                        <FormSection title="📋 Accordion Sections (shown on product page)">
                            <Field label="Fabric & Weave Details" hint="Shown in 'Fabric & Weave' accordion">
                                <textarea
                                    rows="3" value={formData.fabricDetails}
                                    onChange={e => set('fabricDetails', e.target.value)}
                                    placeholder="e.g. Made from pure Kanjivaram silk with zari border work. Each piece is handcrafted by master weavers..."
                                />
                            </Field>
                            <Field label="Care Instructions" hint="Shown in 'Care Instructions' accordion">
                                <textarea
                                    rows="3" value={formData.careInstructions}
                                    onChange={e => set('careInstructions', e.target.value)}
                                    placeholder="e.g. Dry clean recommended. Avoid direct sunlight when drying. Store folded in muslin cloth."
                                />
                            </Field>
                            <Field label="Shipping & Returns" hint="Shown in 'Shipping & Returns' accordion">
                                <textarea
                                    rows="3" value={formData.shippingInfo}
                                    onChange={e => set('shippingInfo', e.target.value)}
                                    placeholder="e.g. Ships within 2–4 business days. Free shipping above ₹999. Easy 7-day returns for unworn items."
                                />
                            </Field>
                        </FormSection>

                        {/* ── SECTION 6: Style Tip ─────────────────────────── */}
                        <FormSection title="✨ Style Tip (shown as highlighted card on product page)">
                            <Field label="Style Tip" hint="Styling advice shown in the golden tip card">
                                <textarea
                                    rows="3" value={formData.styleTip}
                                    onChange={e => set('styleTip', e.target.value)}
                                    placeholder="e.g. Pair this saree with antique gold jewellery and a deep maroon blouse for a classic South Indian festive look."
                                />
                            </Field>
                        </FormSection>

                        {/* ── SECTION 7: Taxonomy ──────────────────────────── */}
                        <FormSection title="🏷️ Occasions & Collections">
                            <div className="taxonomy-selection">
                                <div className="taxonomy-group">
                                    <label>Occasions</label>
                                    <div className="checkbox-grid">
                                        {occasions.map(occ => (
                                            <label key={occ._id} className="checkbox-item">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.occasions.includes(occ._id)}
                                                    onChange={() => handleTaxonomyChange('occasions', occ._id)}
                                                />
                                                {occ.title}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="taxonomy-group">
                                    <label>Collections</label>
                                    <div className="checkbox-grid">
                                        {collections.map(col => (
                                            <label key={col._id} className="checkbox-item">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.collections.includes(col._id)}
                                                    onChange={() => handleTaxonomyChange('collections', col._id)}
                                                />
                                                {col.title}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </FormSection>

                        {/* Submit */}
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button type="submit" className="admin-btn admin-btn--primary">
                                {editingProduct ? '✅ Update Product' : '➕ Create Product'}
                            </button>
                            <button type="button" className="admin-btn admin-btn--outline" onClick={() => { setShowForm(false); setEditingProduct(null); }}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>

            ) : (

                /* ── Product Table ─────────────────────────────────────────── */
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Category</th>
                                <th>Fabric</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product._id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <img
                                                src={product.images?.[0] || 'https://via.placeholder.com/40'}
                                                alt=""
                                                style={{ width: '44px', height: '56px', objectFit: 'cover', borderRadius: '4px' }}
                                            />
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{product.name}</div>
                                                {product.weaveType && <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{product.weaveType}</div>}
                                            </div>
                                        </div>
                                    </td>
                                    <td>{product.category?.name || '—'}</td>
                                    <td style={{ fontSize: '0.82rem', color: '#6b7280' }}>{product.fabric || product.weaveType || '—'}</td>
                                    <td>
                                        <div style={{ fontWeight: 700 }}>₹{(product.discountedPrice || product.price).toLocaleString('en-IN')}</div>
                                        {product.discountedPrice && <div style={{ fontSize: '0.72rem', color: '#9ca3af', textDecoration: 'line-through' }}>₹{product.price.toLocaleString('en-IN')}</div>}
                                    </td>
                                    <td>
                                        <span style={{ color: product.stock < 5 ? '#dc2626' : 'inherit', fontWeight: product.stock < 5 ? 700 : 400 }}>
                                            {product.stock}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge status-badge--${product.isActive ? 'success' : 'danger'}`}>
                                            {product.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button className="admin-btn admin-btn--outline" onClick={() => handleEdit(product)}>Edit</button>
                                        <button className="admin-btn admin-btn--outline" style={{ color: 'var(--admin-danger)' }} onClick={() => handleDelete(product._id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {products.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '4rem', color: '#9ca3af' }}>
                            <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📦</p>
                            <p>No products yet. Add your first product!</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminProducts;


