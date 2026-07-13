import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

const getInitialTheme = () => {
  const saved = localStorage.getItem('kollective-theme');
  const initial = saved || 'dark';
  // Side-effect: Sync initial theme immediately with document Element
  if (typeof window !== 'undefined') {
    const root = window.document.documentElement;
    if (initial === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }
  return initial;
};

export const useStore = create(
  immer((set) => ({
  // 🎨 1. CORE UI LAYOUT STATE
  // Theme State 
  theme: getInitialTheme(),

  toggleTheme: () => set((state) => {
    const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('kollective-theme', nextTheme);

    // Side-effect: Toggle classes
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      if (nextTheme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
      }
    }

    return { theme: nextTheme };
  }),

  // Modal Control States
  isCreatePostOpen: false,
  setCreatePostOpen: (isOpen) => set({ isCreatePostOpen: isOpen }),

  // Organization Preferences
  showPersonalHandleOnOrg: true,
  setShowPersonalHandleOnOrg: (show) => set({ showPersonalHandleOnOrg: show }),

  // Home Feed State persistence
  homeFeedTab: 'All Activity',
  homeFeedScroll: 0,
  setHomeFeedTab: (tab) => set({ homeFeedTab: tab }),
  setHomeFeedScroll: (scroll) => set({ homeFeedScroll: scroll }),

  // Communities State persistence
  communitiesTab: 'Local',
  communitiesScroll: 0,
  setCommunitiesTab: (tab) => set({ communitiesTab: tab }),
  setCommunitiesScroll: (scroll) => set({ communitiesScroll: scroll }),

  // Events State persistence
  eventsScroll: 0,
  setEventsScroll: (scroll) => set({ eventsScroll: scroll }),

  // Deeply Nested Layout Spaces and Action Modifiers 
  navigation: {
    activeTimeline: 'home',
    sidebarExpanded: true,
  },
  setTimeline: (timeline) =>
    set((state) => {
      state.navigation.activeTimeline = timeline;
    }),
  toggleSidebar: () =>
    set((state) => {
      state.navigation.sidebarExpanded = !state.navigation.sidebarExpanded;
    }),

  compose: {
    isOpen: false, // Unified modal trigger state
    drafts: {
      home: '',
      direct: '',
    },
  },
  resetCompose: () =>
    set((state) => {
      state.compose.isOpen = false;
      state.compose.drafts.home = '';
    }),
  updateDraft: (type, text) =>
    set((state) => {
      state.compose.drafts[type] = text;
    }),
  // Composite Modal Resets
  setCreatePostOpen: (isOpen) =>
    set((state) => {
      state.compose.isOpen = isOpen;
      state.isCreatePostOpen = isOpen;
    }),
  setComposeOpen: (isOpen) =>
    set((state) => {
      state.compose.isOpen = isOpen;
      state.isCreatePostOpen = isOpen;
    }),


  modals: {
    activeModal: null, // 'settings' | 'profile' | null
    hoverCardData: null,
    juryAlert: null,   // Real-time Elixir platform summons data placeholder
  },
  openModal: (modalName) =>
    set((state) => {
      state.modals.activeModal = modalName;
    }),
  setHoverCard: (data) =>
    set((state) => {
      state.modals.hoverCardData = data;
    }),
  // Real-Time Platform Summons Setter
  setJuryAlert: (alert) =>
    set((state) => {
      state.modals.juryAlert = alert;
    }),

})));


