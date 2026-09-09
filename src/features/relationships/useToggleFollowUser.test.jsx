// src/features/relationships/useToggleFollowUser.test.jsx
import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useToggleFollowUser } from './useRelationshipsFeature';
import { useAccountsStore } from '../../store/useAccountsStore';
import { testServer } from '../../test/serverHandlers';
import { createWrapper } from '../../test/testUtils';

// 📡 1. Spin up the network interception mock engine
beforeAll(() => testServer.listen());
afterEach(() => {
    testServer.resetHandlers();
    // 🧼 CRITICAL DISK DISPOSAL: Wipe the Zustand entities map clean between tests 
    // to ensure test case isolation.
    useAccountsStore.setState({ entities: {} });
});
afterAll(() => testServer.close());

describe('Normalized Follow Mutation Graph Test Suite', () => {
    it('should optimistically update the state inside Zustand lookups instantly, then merge server data', async () => {
        const targetUserId = "user-abc-99";

        // 2. Pre-seed our look-up dictionary with an un-followed account stub model
        useAccountsStore.getState().importFetchedAccounts([
            { id: targetUserId, username: "target_user", name: "Target User", following: false, followersCount: 150 }
        ]);

        // Verify initial preconditions are safely set in memory
        expect(useAccountsStore.getState().entities[targetUserId].following).toBe(false);

        // 3. Mount the hook inside an isolated TanStack Query Client wrapper environment
        const { result } = renderHook(() => useToggleFollowUser(), {
            wrapper: createWrapper()
        });

        // 4. Trigger the relationship follow mutation stream click action
        result.current.mutate(targetUserId);

        // ⚡ 5. THE OPTIMISTIC UI VALIDATION CHECK:
        // This asserts that the Zustand lookup flipped to true IMMEDIATELY on the click tick,
        // before waiting for the asynchronous server worker parameters to resolve.
        expect(useAccountsStore.getState().entities[targetUserId].following).toBe(true);
        expect(useAccountsStore.getState().entities[targetUserId].followersCount).toBe(151);

        // 6. Wait for the asynchronous network promise to cleanly settle downstream
        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        // 7. Verify the final Zustand lookups reflect the authoritative server response object data
        const finalizedEntity = useAccountsStore.getState().entities[targetUserId];
        expect(finalizedEntity.following).toBe(true);
        expect(finalizedEntity.username).toBe("target_user");
    });

    it('should gracefully roll back Zustand entities to original values if the network layer fails', async () => {
        const targetUserId = "user-fail-100";

        // Inject an intentional network breakdown override closure into our MSW runtime handler
        testServer.use(
            http.post('/api/v1/accounts/:id/follow', () => {
                return new HttpResponse(null, { status: 500 });
            })
        );

        // Pre-seed baseline metrics
        useAccountsStore.getState().importFetchedAccounts([
            { id: targetUserId, name: "Broken Node", following: false, followersCount: 5 }
        ]);

        const { result } = renderHook(() => useToggleFollowUser(), { wrapper: createWrapper() });

        // Fire failure sequence mutation
        result.current.mutate(targetUserId);

        // Assert transient optimistic shift was armed
        expect(useAccountsStore.getState().entities[targetUserId].following).toBe(true);

        // Wait for failure settlement execution
        await waitFor(() => expect(result.current.isError).toBe(true));

        // 🛡️ THE DETERMINISTIC FALLBACK CHECK:
        // Verify that our onError guard block intercepted the server fault and perfectly 
        // restored the original profile dictionary metrics back to the display canvas view.
        expect(useAccountsStore.getState().entities[targetUserId].following).toBe(false);
        expect(useAccountsStore.getState().entities[targetUserId].followersCount).toBe(5);
    });
});
