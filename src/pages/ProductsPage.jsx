/**
 * Products Page
 * Refined Collection with Professional Search and URL-based Filtering
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/ProductCard';
import '../styles/products.css';

const ProductsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    // Get filters from URL
    const initialSearch = searchParams.get('search') || '';

    const [searchTerm, setSearchTerm] = useState(initialSearch);

    // Centralized filters for the hook
    const filters = {
        search: searchParams.get('search') || '',
        occasion: searchParams.get('occasion') || '',
        collection: searchParams.get('collection') || '',
        isActive: true
    };

    const { products, loading, error, refetch } = useProducts(filters);

    // Sync search input with URL if URL changes elsewhere
    useEffect(() => {
        setSearchTerm(searchParams.get('search') || '');
    }, [searchParams]);

    // Live search - Update URL when user stops typing
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const newParams = new URLSearchParams(searchParams);
            if (searchTerm.trim()) {
                if (newParams.get('search') !== searchTerm.trim()) {
                    newParams.set('search', searchTerm.trim());
                    setSearchParams(newParams);
                }
            } else if (searchParams.get('search')) {
                newParams.delete('search');
                setSearchParams(newParams);
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(timeoutId);
    }, [searchTerm, setSearchParams, searchParams]);

    // Update URL when search is submitted (for mobile/instant response)
    const handleSearchSubmit = (e) => {
        e?.preventDefault();
        const newParams = new URLSearchParams(searchParams);
        if (searchTerm.trim()) {
            newParams.set('search', searchTerm.trim());
        } else {
            newParams.delete('search');
        }
        setSearchParams(newParams);
    };

    useEffect(() => {
        refetch();
    }, [searchParams, refetch]);

    const clearAll = () => {
        setSearchTerm('');
        setSearchParams({});
    };

    return (
        <main className="products-page">
            <div className="products-container">
                <header className="products-header">
                    <h1 className="products-title">The Heritage Collection</h1>
                    <p className="products-subtitle">Discover the artisanal mastery of Surat's finest weavers</p>

                    {/* Professional Search Bar */}
                    <div className="search-bar-container">
                        <form className="search-form" onSubmit={handleSearchSubmit}>
                            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Discover your next heirloom..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                            {searchTerm && (
                                <button type="button" className="search-clear" onClick={() => { setSearchTerm(''); setSearchParams({}); }}>
                                    ✕
                                </button>
                            )}
                            <button type="submit" className="search-submit">Search</button>
                        </form>
                    </div>

                </header>

                <div className="products-main">
                    {loading ? (
                        <div className="products-loading-state">
                            <div className="loading-spinner"></div>
                            <p>Refining our collection for you...</p>
                        </div>
                    ) : error ? (
                        <div className="products-error">
                            <p>Something went wrong. Please refresh the page.</p>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="products-empty">
                            <div className="products-empty__icon">✨</div>
                            <h2 className="products-empty__title">No masterpieces found</h2>
                            <p>Try a different keyword or explore our full collection.</p>
                            <button onClick={clearAll} className="products-empty__btn">View All Sarees</button>
                        </div>
                    ) : (
                        <div className="products-grid">
                            {products.map((product, index) => (
                                <div
                                    key={product._id}
                                    className="products-grid__item"
                                    style={{ animationDelay: `${(index % 8) * 0.1}s` }}
                                >
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};


export default ProductsPage;
