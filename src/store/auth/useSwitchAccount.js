// src/store/auth/useSwitchAccount.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from './useAuthStore';

// Instant UI Account Switcher hook
export function useSwitchAccount() {
    const queryClient = useQueryClient();
    const setActiveAccount = useAuthStore((state) => state.setActiveAccount);

    const switchAccount = (targetAccountProfile) => {
        // targetAccountProfile comes from the profile list fetched from the API above
        // e.g., { id: "org_123", type: "organization", name: "Acme Corp", ... }

        // 1. Switch local context instantly
        setActiveAccount(targetAccountProfile);

        // 2. Clear out old personal data cache completely
        queryClient.clear();

        // 3. TanStack will automatically refetch data using the new X-Active-Account-Id header
    };

    return { switchAccount };
}