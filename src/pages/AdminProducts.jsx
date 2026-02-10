import { useState, useEffect } from 'react';
import { productsAPI, categoriesAPI, occasionsAPI, collectionsAPI, uploadAPI } from '../services/api';
import toast from 'react-hot-toast';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [occasions, setOccasions] = useState([]);
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        discountedPrice: '',
        category: '',
        weaveType: '',
        stock: 1,
        isActive: true,
        occasions: [],
        collections: [],
        images: []
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [pData, cData, oData, colData] = await Promise.all([
                productsAPI.getAll(),
                categoriesAPI.getAll(),
                occasionsAPI.getAll(),
                collectionsAPI.getAll()
            ]);
            setProducts(pData);
            setCategories(cData);
            setOccasions(oData);
            setCollections(colData);
        } catch (err) {
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            ...product,
            price: product.price.toString(),
            discountedPrice: product.discountedPrice?.toString() || '',
            stock: Math.max(0, product.stock).toString(),
            category: product.category?._id || product.category // Handle populated vs ID
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this masterpiece?')) {
            try {
                await productsAPI.delete(id);
                toast.success('Product deleted');
                fetchData();
            } catch (err) {
                toast.error('Failed to delete product');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Prepare data with correct types and ensure non-negative
        const submissionData = {
            ...formData,
            price: Math.max(0, Number(formData.price)),
            discountedPrice: formData.discountedPrice ? Math.max(0, Number(formData.discountedPrice)) : undefined,
            stock: Math.max(0, Number(formData.stock))
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
            fetchData();
        } catch (err) {
            toast.error(err.message || 'Operation failed');
        }
    };

    const handleTaxonomyChange = (type, id) => {
        const current = [...formData[type]];
        const index = current.indexOf(id);
        if (index > -1) {
            current.splice(index, 1);
        } else {
            current.push(id);
        }
        setFormData({ ...formData, [type]: current });
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const loadingToast = toast.loading('Uploading heritage images...');
        try {
            const uploadPromises = files.map(file => {
                const fd = new FormData();
                fd.append('image', file);
                return uploadAPI.uploadImage(fd);
            });

            const results = await Promise.all(uploadPromises);
            const newUrls = results.map(res => res.url);

            setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...newUrls]
            }));
            toast.success('Images uploaded successfully', { id: loadingToast });
        } catch (err) {
            toast.error('Failed to upload images', { id: loadingToast });
        }
    };

    const removeImage = (index) => {
        const newImages = [...formData.images];
        newImages.splice(index, 1);
        setFormData({ ...formData, images: newImages });
    };

    if (loading) return <div className="admin-loading">Loading Collection...</div>;

    return (
        <div className="admin-products">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 className="admin-title">Product Management</h2>
                {!showForm && (
                    <button className="admin-btn admin-btn--primary" onClick={() => {
                        setEditingProduct(null);
                        setFormData({
                            name: '', description: '', price: '', discountedPrice: '',
                            category: '', weaveType: '', stock: 1, isActive: true,
                            occasions: [], collections: [], images: []
                        });
                        setShowForm(true);
                    }}>
                        + Add New Product
                    </button>
                )}
            </div>

            {showForm ? (
                <div className="admin-card">
                    <h3>{editingProduct ? 'Edit Product' : 'Add New Saree'}</h3>
                    <form onSubmit={handleSubmit} className="admin-form">
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Product Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Base Price (₹)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Discounted Price (optional)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.discountedPrice}
                                    onChange={(e) => setFormData({ ...formData, discountedPrice: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Stock Quantity</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.stock}
                                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Weave Type</label>
                                <input
                                    type="text"
                                    value={formData.weaveType}
                                    onChange={(e) => setFormData({ ...formData, weaveType: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="form-group" style={{ marginTop: '1.5rem' }}>
                            <label>Product Images</label>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="admin-file-input"
                                style={{ marginBottom: '1rem' }}
                            />
                            <div className="image-preview-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '1rem' }}>
                                {formData.images.map((url, idx) => (
                                    <div key={idx} style={{ position: 'relative', height: '100px' }}>
                                        <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(idx)}
                                            style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--admin-danger)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '10px' }}
                                        >✕</button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="form-group" style={{ marginTop: '1.5rem' }}>
                            <label>Description</label>
                            <textarea
                                rows="4"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                            />
                        </div>

                        <div className="taxonomy-selection">
                            <div className="taxonomy-group">
                                <label>Select Occasions</label>
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
                                <label>Select Collections</label>
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

                        <div className="form-actions" style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                            <button type="submit" className="admin-btn admin-btn--primary">
                                {editingProduct ? 'Update Product' : 'Create Product'}
                            </button>
                            <button type="button" className="admin-btn admin-btn--outline" onClick={() => setShowForm(false)}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product._id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <img
                                                src={product.images?.[0] || 'https://via.placeholder.com/40'}
                                                alt=""
                                                style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                                            />
                                            <span style={{ fontWeight: '500' }}>{product.name}</span>
                                        </div>
                                    </td>
                                    <td>{product.category?.name || 'Uncategorized'}</td>
                                    <td>₹{product.price.toLocaleString('en-IN')}</td>
                                    <td>
                                        <span style={{
                                            color: product.stock < 5 ? 'var(--admin-danger)' : 'inherit',
                                            fontWeight: product.stock < 5 ? '700' : '400'
                                        }}>
                                            {product.stock}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge status-badge--${product.isActive ? 'success' : 'danger'}`}>
                                            {product.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button className="admin-btn admin-btn--outline" onClick={() => handleEdit(product)}>
                                            Edit
                                        </button>
                                        <button className="admin-btn admin-btn--outline" style={{ color: 'var(--admin-danger)' }} onClick={() => handleDelete(product._id)}>
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminProducts;
