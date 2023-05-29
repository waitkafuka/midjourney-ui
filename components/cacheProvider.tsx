import React, { createContext, useState, FC, ReactNode } from 'react';

interface CacheContextProps {
    setCacheItem: (key: string, value: ReactNode) => void;
    getCacheItem: (key: string) => ReactNode | undefined;
}

export const CacheContext = createContext<CacheContextProps>({
    setCacheItem: () => { },
    getCacheItem: () => undefined,
});

export const CacheProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [cache, setCache] = useState<{ [key: string]: ReactNode }>({});

    const setCacheItem = (key: string, value: ReactNode) => {
        setCache({ ...cache, [key]: value });
    };

    const getCacheItem = (key: string) => {
        return cache[key];
    };

    return (
        <CacheContext.Provider value={{ setCacheItem, getCacheItem }}>
            {children}
        </CacheContext.Provider>
    );
};