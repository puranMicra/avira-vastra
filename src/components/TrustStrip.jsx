/**
 * TrustStrip Component
 * Premium Traditional Saree Brand - Mobile First
 * Quiet reassurance for Indian buyers
 */

import '../styles/trust-strip.css';

const TrustStrip = () => {
    return (
        <section className="trust-strip">
            <div className="trust-strip__container">

                {/* Cash on Delivery */}
                <div className="trust-strip__item stagger-item">
                    <svg className="trust-strip__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="5" width="20" height="14" rx="2" />
                        <line x1="2" y1="10" x2="22" y2="10" />
                    </svg>
                    <span className="trust-strip__text">Cash on Delivery</span>
                </div>

                {/* WhatsApp Assistance */}
                <div className="trust-strip__item stagger-item">
                    <svg className="trust-strip__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    </svg>
                    <span className="trust-strip__text">WhatsApp Assistance</span>
                </div>

                {/* Easy Exchange */}
                <div className="trust-strip__item stagger-item">
                    <svg className="trust-strip__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 12h18" />
                        <path d="M3 12l4-4m-4 4l4 4" />
                        <path d="M21 12l-4-4m4 4l-4 4" />
                    </svg>
                    <span className="trust-strip__text">Easy Exchange</span>
                </div>

                {/* Pan India Shipping */}
                <div className="trust-strip__item stagger-item">
                    <svg className="trust-strip__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="1" y="3" width="15" height="13" />
                        <path d="M16 8h5l3 3v5h-2" />
                        <circle cx="5.5" cy="18.5" r="1.5" />
                        <circle cx="18.5" cy="18.5" r="1.5" />
                    </svg>
                    <span className="trust-strip__text">Pan India Shipping</span>
                </div>

            </div>
        </section>
    );
};

export default TrustStrip;
