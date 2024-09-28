import { useState, useEffect } from 'react';
import { checkAuthStatus } from '../request/http'; // 假设我们有一个API请求来检查用户的登录状态

export const useAuth = () => {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchAuthStatus = async () => {
            try {
                const status = await checkAuthStatus();
                setIsLoggedIn(status);
            } catch (error) {
                console.error('Failed to check auth status:', error);
                setIsLoggedIn(false);
            } finally {
                setLoading(false);
            }
        };

        fetchAuthStatus();
    }, []);

    return { isLoggedIn, loading };
};