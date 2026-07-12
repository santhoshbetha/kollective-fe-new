import { useEffect } from 'react';
import { useAuthStore } from './useAuthStore';

export function useSessionRecovery() {
    const setSession = useAuthStore((state) => state.setSession);
    const setHydrated = useAuthStore((state) => state.setHydrated);

    useEffect(() => {
        const recoverSession = async () => {
            try {
                const storedToken = localStorage.getItem('auth_token');
                const storedUser = localStorage.getItem('auth_user');

                if (storedToken && storedUser) {
                    // If a token exists, decode it or sync it directly to the store
                    const parsedUser = JSON.parse(storedUser);

                    // Optional: You could do a quick token validation check API call here
                    setSession(storedToken, parsedUser);
                } else {
                    // No token found, user is a guest
                    setHydrated();
                }
            } catch (error) {
                console.error('Failed to restore authentication session:', error);
                setHydrated();
            }
        };

        recoverSession();
    }, [setSession, setHydrated]);
}
