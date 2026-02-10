/**
 * iOS Safari Viewport Fix - BLOCKING SCRIPT
 * 
 * CRITICAL: This script MUST run BEFORE first paint to prevent layout flash.
 * It is loaded as a blocking script in <head> to ensure iOS Safari
 * calculates viewport height before rendering any content.
 * 
 * Why this is necessary:
 * - iOS Safari performs early paint before viewport height is finalized
 * - 100vh includes browser chrome (address bar + toolbar)
 * - CSS-only solutions (dvh, svh, -webkit-fill-available) are unreliable
 * - Safari recalculates height after reload, causing white gaps
 * 
 * This only affects REAL iOS Safari, not Chrome DevTools emulation.
 */

(function () {
    'use strict';

    /**
     * Calculate and set the actual viewport height
     * This runs synchronously to block rendering
     */
    function setRealViewportHeight() {
        // Get the ACTUAL viewport height (excludes browser chrome)
        const vh = window.innerHeight * 0.01;

        // Set CSS custom property immediately
        document.documentElement.style.setProperty('--vh', vh + 'px');

        // Also set full height for convenience
        document.documentElement.style.setProperty('--real-vh', window.innerHeight + 'px');

        // Debug log (remove in production if needed)
        if (window.console && window.console.log) {
            console.log('[iOS Fix] Viewport height set:', window.innerHeight + 'px', '(1vh = ' + vh + 'px)');
        }
    }

    /**
     * Detect if running on iOS Safari
     */
    function isIOSSafari() {
        const ua = navigator.userAgent;
        const iOS = /iPad|iPhone|iPod/.test(ua);
        const webkit = /WebKit/.test(ua);
        const notChrome = !/CriOS|Chrome/.test(ua);
        const notFirefox = !/FxiOS/.test(ua);

        return iOS && webkit && notChrome && notFirefox;
    }

    /**
     * Initial setup - runs immediately
     */
    setRealViewportHeight();

    /**
     * Update on resize (debounced)
     * This handles orientation changes and address bar show/hide
     */
    let resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(setRealViewportHeight, 100);
    }, { passive: true });

    /**
     * iOS-specific: Update on orientation change
     * Delay ensures viewport has settled
     */
    window.addEventListener('orientationchange', function () {
        setTimeout(setRealViewportHeight, 300);
    });

    /**
     * iOS-specific: Update when scrolling stops
     * Address bar show/hide affects viewport
     */
    if (isIOSSafari()) {
        let scrollTimer;
        window.addEventListener('scroll', function () {
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(setRealViewportHeight, 150);
        }, { passive: true });

        // Visual Viewport API (iOS 13+)
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', setRealViewportHeight);
            window.visualViewport.addEventListener('scroll', function () {
                clearTimeout(scrollTimer);
                scrollTimer = setTimeout(setRealViewportHeight, 150);
            });
        }
    }

    /**
     * Ensure height is set after DOM is ready
     * (in case something reset it)
     */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setRealViewportHeight);
    }

    /**
     * Final check after page load
     */
    window.addEventListener('load', setRealViewportHeight);

})();
