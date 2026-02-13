/**
 * HeritageWeaves Component
 * Premium Traditional Saree Brand - Mobile First
 * Professional implementation with custom hooks
 */

import { Link } from 'react-router-dom';
import { useCollections } from '../hooks/useCollections';
import SectionLoader from './SectionLoader';
import SectionError from './SectionError';
import '../styles/heritage-weaves.css';

const HeritageWeaves = () => {
    // Fetch all collections
    const { collections, loading, error, refetch } = useCollections();

    // Format collection data for display
    const formatCollection = (collection) => ({
        id: collection._id,
        title: collection.title,
        subtitle: collection.subtitle || 'Explore our collection',
        image: collection.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80',
        link: `/products?collection=${collection._id}`,
        overlayLight: true // Can be customized based on image brightness
    });

    // Filter active collections and sort by sortOrder
    const displayCollections = collections
        .filter(col => col.isActive !== false)
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
        .slice(0, 4) // Show top 4
        .map(formatCollection);

    return (
        <section className="heritage-weaves">
            <div className="heritage-weaves__container">

                {/* Section Header */}
                <div className="heritage-weaves__header">
                    <h2 className="heritage-weaves__title">
                        <span className="title-reveal">Our Heritage Weaves</span>
                    </h2>
                    <p className="heritage-weaves__subtitle">
                        Timeless traditions honoured across generations
                    </p>
                </div>

                {/* Loading State */}
                {loading && (
                    <SectionLoader message="Retrieving artisanal archives..." height="300px" />
                )}

                {/* Error State */}
                {error && !loading && (
                    <SectionError onRetry={refetch} height="300px" />
                )}

                {/* Empty State */}
                {!loading && !error && displayCollections.length === 0 && (
                    <div className="heritage-weaves__empty">
                        <p>No collections available at the moment.</p>
                    </div>
                )}

                {/* Weaves Cards */}
                {!loading && !error && displayCollections.length > 0 && (
                    <div className="heritage-weaves__grid">
                        {displayCollections.map((weave, index) => (
                            <Link
                                key={weave.id}
                                to={weave.link}
                                className={`weave-card heritage-weaves__item stagger-item ${weave.overlayLight ? 'weave-card--light-overlay' : ''}`}
                                style={{ animationDelay: `${index * 0.15}s` }}
                            >
                                {/* Image */}
                                <div className="weave-card__image-wrapper">
                                    <img
                                        src={weave.image}
                                        alt={`${weave.title} - ${weave.subtitle}`}
                                        className="weave-card__image"
                                        loading="lazy"
                                    />
                                    {/* Soft Overlay */}
                                    <div className="weave-card__overlay" aria-hidden="true" />
                                </div>

                                {/* Content */}
                                <div className="weave-card__content">
                                    <h3 className="weave-card__title">{weave.title}</h3>
                                    <p className="weave-card__subtitle">{weave.subtitle}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

            </div>
        </section>
    );
};

export default HeritageWeaves;
