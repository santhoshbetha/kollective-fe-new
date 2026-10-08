import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { createJSONStorage } from 'zustand/middleware';

const applyThemeToDOM = (themeName) => {
  if (typeof window !== 'undefined') {
    const root = window.document.documentElement;
    if (themeName === 'dark-bluish') {
      root.classList.add('dark', 'dark-bluish');
      root.classList.remove('light', 'light-bluish');
    } else if (themeName === 'light-bluish') {
      root.classList.add('light', 'light-bluish');
      root.classList.remove('dark', 'dark-bluish');
    } else if (themeName === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light', 'dark-bluish', 'light-bluish');
    } else {
      root.classList.add('light');
      root.classList.remove('dark', 'dark-bluish', 'light-bluish');
    }
  }
};

const getInitialTheme = () => {
  const saved = localStorage.getItem('kollective-theme');
  const initial = saved || 'dark';
  applyThemeToDOM(initial);
  return initial;
};

export const useStore = create(
  immer((set) => ({
    // 🎨 1. CORE UI LAYOUT STATE
    // Theme State 
    theme: getInitialTheme(),
    appLanguage: 'en-US',    // 'en-US' | 'es-ES' | 'fr-FR'
    homeFeedTab: 'All Activity',
    communitiesTab: 'Local',

    // Volatile Modal & Scroll States
    activeSearchQuery: '',

    setTheme: (nextTheme) => set((state) => {
      localStorage.setItem('kollective-theme', nextTheme);
      applyThemeToDOM(nextTheme);
      return { theme: nextTheme };
    }),

    toggleTheme: () => set((state) => {
      const nextTheme = (state.theme === 'light' || state.theme === 'light-bluish') ? 'dark' : 'light';
      localStorage.setItem('kollective-theme', nextTheme);
      applyThemeToDOM(nextTheme);
      return { theme: nextTheme };
    }),

    setAppLanguage: (targetLang) =>
      set((state) => {
        state.appLanguage = targetLang;
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

    // Polls State persistence
    pollsTab: 'Local',
    pollsScroll: 0,
    setPollsTab: (tab) => set({ pollsTab: tab }),
    setPollsScroll: (scroll) => set({ pollsScroll: scroll }),

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

    // =========================================================================
    // 🗳️ PERSISTENT POLITICAL OPT-IN CONFIGURATION VARIABLES
    // =========================================================================
    politicalOptIn: false,
    politicalCountry: 'US', // 'US' | 'CA' | 'GB' | 'IN' | 'MX' | 'AR' | 'BR' | 'CO' | 'CL' | 'VE' | 'PE' | 'EC' | 'UY' | 'PY' | 'BO' | 'HN' | 'NI' | 'CR' | 'PA' | 'DO' | 'PR'
    userState: '',
    stateUpdatedAt: null,
    streetAddress: '',
    userCity: '',
    districtFederal: '',
    districtStateLower: '',
    districtStateUpper: '',

    setUserState: (userState) => set((state) => {
      state.userState = userState;
    }),

    setStateUpdatedAt: (timestamp) => set((state) => {
      state.stateUpdatedAt = timestamp;
    }),

    setStreetAddress: (streetAddress) => set((state) => {
      state.streetAddress = streetAddress;
    }),

    setUserCity: (userCity) => set((state) => {
      state.userCity = userCity;
    }),

    setPoliticalOptIn: (optIn) => set((state) => {
      state.politicalOptIn = optIn;
      if (!optIn) {
        // Zero out telemetry data keys if a citizen explicitly chooses to opt out
        state.districtFederal = '';
        state.districtStateLower = '';
        state.districtStateUpper = '';
      }
    }),

    setPoliticalCountry: (country) => set((state) => {
      state.politicalCountry = country;
      state.districtFederal = '';
      state.districtStateLower = '';
      state.districtStateUpper = '';
    }),

    setDistrictFields: (fields) => set((state) => {
      if (fields.federal !== undefined) state.districtFederal = fields.federal;
      if (fields.stateLower !== undefined) state.districtStateLower = fields.stateLower;
      if (fields.stateUpper !== undefined) state.districtStateUpper = fields.stateUpper;
    }),

  })),
  {
    name: 'kollective-app-state-matrix',
    storage: createJSONStorage(() => localStorage),

    // 🎯 Select exactly what keys cross the storage matrix down into local storage disk blocks
    partialize: (state) => ({
      theme: state.theme,
      appLanguage: state.appLanguage,
      homeFeedTab: state.homeFeedTab,
      communitiesTab: state.communitiesTab,
      politicalOptIn: state.politicalOptIn,
      politicalCountry: state.politicalCountry,
      userState: state.userState,
      stateUpdatedAt: state.stateUpdatedAt,
      streetAddress: state.streetAddress,
      userCity: state.userCity,
      districtFederal: state.districtFederal,
      districtStateLower: state.districtStateLower,
      districtStateUpper: state.districtStateUpper
    }),
  }
);


