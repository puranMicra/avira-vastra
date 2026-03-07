/**
 * Custom Hook: useProducts
 * Professional hook for fetching and managing products
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { productsAPI } from '../services/api';

export const useProducts = (filters = {}, options = {}) => {
    const { autoFetch = true } = options;

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(true);

    // Use a ref to store the latest filters to avoid stale closures in effects
    const filtersRef = useRef(filters);
    useEffect(() => {
        filtersRef.current = filters;
    }, [filters]);

    const fetchProducts = useCallback(async (customFilters = {}) => {
        try {
            setLoading(true);
            setError(null);

            const mergedFilters = { ...filtersRef.current, ...customFilters };
            const data = await productsAPI.getAll(mergedFilters);

            // Backend returns { products: [...], pagination: {...} }
            // Fall back gracefully if response is a plain array (backwards compat)
            const list = data?.products ?? (Array.isArray(data) ? data : []);
            const limit = mergedFilters.limit || 20;

            setProducts(list);
            setHasMore(list.length >= limit);

        } catch (err) {
            setError(err.message || 'Failed to fetch products');
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Effect to refetch whenever the filters object itself (from the parent) changes
    // We use JSON.stringify to have a stable dependency
    const filtersKey = JSON.stringify(filters);

    useEffect(() => {
        if (autoFetch) {
            fetchProducts();
        }
    }, [autoFetch, fetchProducts, filtersKey]);

    return {
        products,
        loading,
        error,
        hasMore,
        refetch: fetchProducts,
        fetchProducts,
    };
};

export const useProduct = (productId) => {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchProduct = useCallback(async () => {
        if (!productId) return;

        try {
            setLoading(true);
            setError(null);

            const data = await productsAPI.getById(productId);
            setProduct(data);
        } catch (err) {
            setError(err.message || 'Failed to fetch product');
            setProduct(null);
        } finally {
            setLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        fetchProduct();
    }, [fetchProduct]);

    return {
        product,
        loading,
        error,
        refetch: fetchProduct,
    };
};

export default useProducts;
