import { useContext, useEffect, ReactNode, FC } from 'react';
import { CacheContext } from './cacheProvider';

interface CacheablePageProps {
    cacheKey: string;
    children: ReactNode;
}

export const CacheablePage: (arg0: CacheablePageProps) => ReactNode = ({
    cacheKey,
    children
}: CacheablePageProps) => {
    const { setCacheItem, getCacheItem } = useContext(CacheContext);

    useEffect(() => {
        if (!getCacheItem(cacheKey)) {
            setCacheItem(cacheKey, children);
        }
    }, []);

    return getCacheItem(cacheKey) || children;
};