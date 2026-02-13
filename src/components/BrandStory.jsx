/**
 * BrandStory Component
 * Premium Traditional Saree Brand - Mobile First
 * Emotional depth, not sales
 */

import '../styles/brand-story.css';

const BrandStory = () => {
    return (
        <section className="brand-story">
            <div className="brand-story__container">

                <h2 className="brand-story__title">
                    <span className="title-reveal">Not Fashion. Sanskaar.</span>
                </h2>

                <div className="brand-story__text">
                    <p className="stagger-item">A saree is more than what you wear.<br />
                        It is what you choose for your home, your rituals,<br />
                        and your loved ones.</p>

                    <p className="stagger-item">From muhurat and temple visits to family functions,<br />
                        every saree at AviraVastra is chosen with care, respect,<br />
                        and an understanding of tradition.</p>

                    <p className="stagger-item">We choose sarees the same way we would choose for our own daughters.
                        With purity of intent and respect for the occasion.</p>
                </div>

            </div>
        </section>
    );
};

export default BrandStory;
