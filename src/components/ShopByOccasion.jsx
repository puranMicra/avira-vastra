/**
 * ShopByOccasion Component
 * Premium Traditional Saree Brand - Mobile First
 * Professional implementation with custom hooks
 */

import { Link } from 'react-router-dom';
import { useOccasions } from '../hooks/useOccasions';
import SectionLoader from './SectionLoader';
import SectionError from './SectionError';
import '../styles/shop-by-occasion.css';

const ShopByOccasion = () => {
    // Fetch all occasions
    const { occasions, loading, error, refetch } = useOccasions();

    // Format occasion data for display
    const formatOccasion = (occasion) => ({
        id: occasion._id,
        title: occasion.title,
        subtitle: occasion.subtitle || 'Explore our collection',
        image: occasion.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80',
        link: `/products?occasion=${occasion._id}`
    });

    // Filter active occasions and sort by sortOrder
    const displayOccasions = occasions
        .filter(occ => occ.isActive !== false)
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
        .slice(0, 4) // Show top 4
        .map(formatOccasion);

    return (
        <section className="shop-by-occasion">
            <div className="shop-by-occasion__container">

                {/* Section Header */}
                <div className="shop-by-occasion__header">
                    <h2 className="shop-by-occasion__title">
                        <span className="title-reveal">Shop for Sacred Occasions</span>
                    </h2>
                    <p className="shop-by-occasion__subtitle">
                        Find the right saree for every meaningful family moment
                    </p>
                </div>

                {/* Loading State */}
                {loading && (
                    <SectionLoader message="Preparing Sacred Selections..." height="300px" />
                )}

                {/* Error State */}
                {error && !loading && (
                    <SectionError onRetry={refetch} height="300px" />
                )}

                {/* Empty State */}
                {!loading && !error && displayOccasions.length === 0 && (
                    <div className="shop-by-occasion__empty">
                        <p>No occasions available at the moment.</p>
                    </div>
                )}

                {/* Occasion Cards */}
                {!loading && !error && displayOccasions.length > 0 && (
                    <div className="shop-by-occasion__grid">
                        {displayOccasions.map((occasion) => (
                            <Link
                                key={occasion.id}
                                to={occasion.link}
                                className="occasion-card stagger-item"
                            >
                                {/* Image */}
                                <div className="occasion-card__image-wrapper">
                                    <img
                                        src={occasion.image}
                                        alt={`${occasion.title} - ${occasion.subtitle}`}
                                        className="occasion-card__image"
                                        loading="lazy"
                                    />
                                    {/* Gradient Overlay */}
                                    <div className="occasion-card__gradient" aria-hidden="true" />
                                </div>

                                {/* Content */}
                                <div className="occasion-card__content">
                                    <h3 className="occasion-card__title">
                                        {occasion.title}
                                        <span className="occasion-card__arrow" aria-hidden="true">→</span>
                                    </h3>
                                    <p className="occasion-card__subtitle">{occasion.subtitle}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

            </div>
        </section>
    );
};

export default ShopByOccasion;
