import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from './useAuthStore';
import { useTimelineBufferStore } from './useTimelineBufferStore';

export function useLogout() {
    const queryClient = useQueryClient();
    const clearSession = useAuthStore((state) => state.clearSession);
    const clearBuffer = useTimelineBufferStore((state) => state.clearBuffer);

    const logout = () => {
        // 1. Clear layout arrays and pending server streams
        clearBuffer();

        // 2. Clear state, which causes useTimelineSocket's cleanup to run and disconnect the socket
        clearSession();

        // 3. Purge disk storage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');

        // 4. Reset query caches completely
        queryClient.clear();
    };

    return logout;
}
