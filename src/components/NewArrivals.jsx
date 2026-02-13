/**
 * NewArrivals Component
 * Premium Traditional Saree Brand - Mobile First
 * Professional implementation with custom hooks
 */

import { useProducts } from '../hooks/useProducts';
import ProductCard from './ProductCard';
import SectionLoader from './SectionLoader';
import SectionError from './SectionError';
import '../styles/new-arrivals.css';

const NewArrivals = () => {
    // Fetch latest 4 products
    const { products, loading, error, refetch } = useProducts({ limit: 4, isActive: true });

    return (
        <section className="new-arrivals">
            <div className="new-arrivals__container">

                {/* Section Header */}
                <div className="new-arrivals__header">
                    <h2 className="new-arrivals__title">
                        <span className="title-reveal">New Arrivals</span>
                    </h2>
                    <p className="new-arrivals__subtitle">
                        Freshly curated sarees from Surat
                    </p>
                    <div className="new-arrivals__divider"></div>
                </div>

                {/* Loading State */}
                {loading && (
                    <SectionLoader message="Unveiling our newest masterpieces..." height="300px" />
                )}

                {/* Error State */}
                {error && !loading && (
                    <SectionError onRetry={refetch} height="300px" />
                )}

                {/* Empty State */}
                {!loading && !error && products.length === 0 && (
                    <div className="new-arrivals__empty">
                        <p>No products available at the moment.</p>
                        <p className="new-arrivals__empty-subtitle">Check back soon for new arrivals!</p>
                    </div>
                )}

                {/* Product Grid */}
                {!loading && !error && products.length > 0 && (
                    <div className="new-arrivals__grid">
                        {products.map((product, index) => (
                            <div
                                key={product._id}
                                className="new-arrivals__item stagger-item"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                )}

                {/* View All Link */}
                {!loading && products.length > 0 && (
                    <div className="new-arrivals__footer">
                        <a href="/sarees" className="new-arrivals__view-all">
                            <span>Explore Full Collection</span>
                            <span className="new-arrivals__arrow" aria-hidden="true">→</span>
                        </a>
                    </div>
                )}

            </div>
        </section>
    );
};

export default NewArrivals;
