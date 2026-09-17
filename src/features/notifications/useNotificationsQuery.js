// src/features/notifications/useNotificationsQuery.js
import { useInfiniteQuery } from '@tanstack/react-query';
import { apiFetch } from '../../api/apiClient';

import { useAccountsStore } from '../../store/useAccountsStore';
import { usePostsStore } from '../../store/usePostsStore';

export function useNotificationsQuery() {
    return useInfiniteQuery({
        queryKey: ['notifications', 'history'],
        queryFn: ({ pageParam }) => {
            const baseUrl = '/api/v1/notifications';
            const path = pageParam ? `${baseUrl}?max_id=${pageParam}` : baseUrl;
            return apiFetch(path);
        },
        initialPageParam: null,
        getNextPageParam: (lastPage) =>
            lastPage?.nextCursor ?? lastPage?.nextPageId ?? (Array.isArray(lastPage) && lastPage.length > 0 ? lastPage[lastPage.length - 1]?.id : undefined) ?? undefined,
        select: (data) => {
            if (data?.pages) {
                const importFetchedAccounts = useAccountsStore.getState().importFetchedAccounts;
                const importFetchedPosts = usePostsStore.getState().importFetchedPosts;
                data.pages.forEach((page) => {
                    if (!page) return;
                    const items = Array.isArray(page) ? page : page.notifications || [];
                    const accounts = items.map((n) => n.account).filter(Boolean);
                    const posts = items.map((n) => n.status || n.post).filter(Boolean);
                    if (accounts.length > 0) importFetchedAccounts(accounts);
                    if (posts.length > 0) importFetchedPosts(posts);
                });
            }
            return data;
        },
    });
}
