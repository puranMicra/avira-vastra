/**
 * Home Page - Landing Page
 * Main entry point for the application
 */

import Hero from '../components/Hero';
import TrustStrip from '../components/TrustStrip';
import ShopByOccasion from '../components/ShopByOccasion';
import HeritageWeaves from '../components/HeritageWeaves';
import NewArrivals from '../components/NewArrivals';
import BrandStory from '../components/BrandStory';
import BrandPromise from '../components/BrandPromise';
import WhatsAppHelp from '../components/WhatsAppHelp';
import WhySurat from '../components/WhySurat';
import { useScrollReveal } from '../hooks/useScrollReveal';

const HomePage = () => {
    useScrollReveal();

    return (
        <main>
            <Hero />
            <div className="reveal reveal--up">
                <NewArrivals />
            </div>
            <div className="reveal reveal--up">
                <ShopByOccasion />
            </div>
            <div className="reveal reveal--up">
                <HeritageWeaves />
            </div>
            <div className="reveal reveal--up">
                <TrustStrip />
            </div>
            <div className="reveal reveal--up">
                <BrandStory />
            </div>
            <div className="reveal reveal--up">
                <BrandPromise />
            </div>
            <WhatsAppHelp />
            <div className="reveal reveal--up">
                <WhySurat />
            </div>
        </main>
    );
};

export default HomePage;
