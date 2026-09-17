import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PhoenixSocketProvider } from './context/PhoenixSocketContext';
import { LandingPage } from './pages/LandingPage';
import { HomePage } from './pages/HomePage';
import { CommunitiesPage } from './pages/CommunitiesPage';
import { OrganizePage } from './pages/OrganizePage';
import { CreateActionPage } from './pages/CreateActionPage';
import { ActionDetailsPage } from './pages/ActionDetailsPage';
import { PostDetailsPage } from './pages/PostDetailsPage';
import { EventsPage } from './pages/EventsPage';
import { CreateEventPage } from './pages/CreateEventPage';
import { EventDetailsPage } from './pages/EventDetailsPage';
import { LocalBusinessesPage } from './pages/LocalBusinessesPage';
import { BusinessDetailsPage } from './pages/BusinessDetailsPage';
import { PostBusinessPage } from './pages/PostBusinessPage';
import { PostBusinessProposalPage } from './pages/PostBusinessProposalPage';
import { ClassifiedsDirectoryPage } from './pages/ClassifiedsDirectoryPage';
import { PollsPage } from './pages/PollsPage';
import { CreatePollPage } from './pages/CreatePollPage';
import { BusinessProposalDetailsPage } from './pages/BusinessProposalDetailsPage';
import { SettingsPage } from './pages/SettingsPage';
import InvitationsList from './pages/InvitationsList';
import SettingsDashboard from './features/settings/SettingsDashboard';
import { MutesPage } from './pages/MutesPage';
import { BlocksPage } from './pages/BlocksPage';
import { FiltersPage } from './pages/FiltersPage';
import { SettingsPageO } from './pages/SettingsPageO';
import { EditProfilePage } from './pages/EditProfilePage';
import { BookmarksPage } from './pages/BookmarksPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SuggestionsPage } from './pages/SuggestionsPage';
import { HashtagTimelinePage } from './pages/HashtagTimelinePage';
import { ExplorePage } from './pages/ExplorePage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { SignupPageO } from './pages/SignupPageO';
import { UserProfilePage } from './pages/UserProfilePage';
import { AccountLikesPage } from './pages/AccountLikesPage';
import { AccountGalleryPage } from './pages/AccountGalleryPage';
import { NetworkPage } from './pages/NetworkPage';
import { FollowedTagsPage } from './pages/FollowedTagsPage';
import RootAdminDashboard from './pages/admin/RootAdminDashboard';
import ModerationDashboard from './pages/admin/ModerationDashboard';
import UnifiedOnboardingOrchestrator from './pages/UnifiedOnboardingOrchestrator';
import CitizenVerificationDashboard from './pages/CitizenVerificationDashboard';
import ActivistJuryPortal from './components/ActivistJuryPortal';
import UnifiedAdminDashboard from './pages/admin/UnifiedAdminDashboard';
import AdminVideoDashboard from './pages/admin/AdminVideoDashboard';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import ProfilePageDemo from './pages/ProfilePageDemo';
import ScholarDisputePage from './pages/ScholarDisputePage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';

// 🗳️ Grassroots Campaign Engine Matrix Workspace Pages
import { CandidacyApplicationPage } from './pages/campaigns/CandidacyApplicationPage';
import { CampaignRegistryPage } from './pages/campaigns/CampaignRegistryPage';
import { CandidateStudioPage } from './pages/campaigns/CandidateStudioPage';
import { AssemblyHallPage } from './pages/campaigns/AssemblyHallPage';
import { EndorsementHubPage } from './pages/campaigns/EndorsementHubPage';
import { LocalOfficeDirectoryPage } from './pages/campaigns/LocalOfficeDirectoryPage';
import { CivicAssemblyHubPage } from './pages/campaigns/CivicAssemblyHubPage';
import { DeadlineManagerPage } from './pages/campaigns/DeadlineManagerPage';

import CandidacyReviewPanel from './pages/admin/CandidacyReviewPanel';

// Guard & Layout Wrappers
import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './components/MainLayout';
import { ProfilePage } from './pages/ProfilePage';
import { ProfileEditPage } from './pages/ProfileEditPage';
import { AlertProvider } from './context/AlertContext';

import { useAuthStore } from './store/auth/useAuthStore';
import { KollectiveSpinner } from './components/ui/KollectiveSpinner';
import { TopProgressBar } from './components/ui/TopProgressBar';


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

export default function App() {
  // ⚡ ATOMIC OBSERVATION: Tracks initialization states cleanly
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoggingIn = useAuthStore((state) => state.isLoggingIn);
  const isLoggingOut = useAuthStore((state) => state.isLoggingOut);
  const executeLogout = useAuthStore((state) => state.executeLogout);

  // 🏗️ Atomic Render Gate: Only open doors after hydration truth
  // Show a global splash screen while checking localStorage, preventing UI flashing
  if (!isHydrated) {
    return (
      <QueryClientProvider client={queryClient}>
        <KollectiveSpinner variant="fullscreen" size="lg" text="Initializing Kollective Node..." />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AlertProvider>
        {isLoggingIn && <KollectiveSpinner variant="fullscreen" size="lg" text="Authenticating Credentials..." />}
        {isLoggingOut && <KollectiveSpinner variant="fullscreen" size="lg" text="Securing Session & Logging Out..." />}
        <BrowserRouter>
          <TopProgressBar />
          <Routes>
            {/* 🌍 1. PUBLIC ROUTES (No Auth Required) */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/create-account" element={<SignupPage />} />
            <Route path="/signupo" element={<SignupPageO />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />

            {/* 🔒 2. PRIVATE APPS (Auth Verified Layout Group) */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                {/* App Dashboard Pages */}
                <Route path="/home" element={<HomePage />} />
                <Route path="/communities" element={<CommunitiesPage />} />
                <Route path="/explore" element={<ExplorePage />} />
                <Route path="/bookmarks" element={<BookmarksPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/suggestions" element={<SuggestionsPage />} />
                <Route path="/post/:id" element={<PostDetailsPage />} />
                <Route path="/tags/:id" element={<HashtagTimelinePage />} />

                {/* Events Flow */}
                <Route path="/events" element={<EventsPage />} />
                <Route path="/events/create" element={<CreateEventPage />} />
                <Route path="/events/:id" element={<EventDetailsPage />} />

                {/* Local Businesses Routes */}
                <Route path="/businesses" element={<LocalBusinessesPage />} />
                <Route path="/businesses/register" element={<PostBusinessPage />} />
                <Route path="/businesses/propose" element={<PostBusinessProposalPage />} />
                <Route path="/businesses/:id" element={<BusinessDetailsPage />} />
                <Route path="/proposals/:id" element={<BusinessProposalDetailsPage />} />
                <Route path="/classifieds" element={<ClassifiedsDirectoryPage />} />

                {/* Polls Routes */}
                <Route path="/polls" element={<PollsPage />} />
                <Route path="/polls/create" element={<CreatePollPage />} />

                {/* Organize Flow */}
                <Route path="/organize" element={<OrganizePage />} />
                <Route path="/organize/create" element={<CreateActionPage />} />
                <Route path="/organize/:id" element={<ActionDetailsPage />} />

                {/* Account Management */}
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/settingso" element={<SettingsPageO />} />
                <Route path="/settings/invitations" element={<InvitationsList />} />
                <Route path="/settings/organization" element={<SettingsDashboard />} />
                <Route path="/settings/profile" element={<EditProfilePage />} />
                <Route path="/settings/mutes" element={<MutesPage />} />
                <Route path="/settings/blocks" element={<BlocksPage />} />
                <Route path="/settings/filters" element={<FiltersPage />} />

                {/* 👤 Profile Ecosystem Directory */}
                <Route path="/profile/:username" element={<UserProfilePage />} />

                <Route path="/profile-demo" element={<ProfilePageDemo />} />

                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/@:username" element={<ProfilePage />} />
                <Route path="/@:username/likes" element={<AccountLikesPage />} />
                <Route path="/@:username/media" element={<AccountGalleryPage />} />
                <Route path="/accounts/:id/network" element={<NetworkPage />} />
                <Route path="/followed-tags" element={<FollowedTagsPage />} />
                <Route path="/profile/edit" element={<ProfileEditPage />} />

                {/* ========================================================================= */}
                {/* 🗳️ CIVIC CAMPAIGN CORE PIPELINE SYSTEM ROUTES */}
                {/* ========================================================================= */}

                {/* A. Dynamic Local Municipal Office Grids Switchboard */}
                <Route path="/campaigns/local" element={<CivicAssemblyHubPage />} />
                <Route path="/campaigns/local2" element={<LocalOfficeDirectoryPage />} />

                {/* <Route path="/campaigns/civic-assembly-hub" element={<CivicAssemblyHubPage />} /> */}

                {/* B. Assembly Hall (Volunteer Shift Logistcs Registries) */}
                <Route path="/campaigns/debates" element={<AssemblyHallPage />} />

                {/* C. Endorsement Hub (Spotlight Consensus Vetted Nominees) */}
                <Route path="/campaigns/consensus" element={<EndorsementHubPage />} />

                {/* D. Application for Office */}
                <Route path="/campaigns/apply" element={<CandidacyApplicationPage />} />

                {/* E. Candidate Studio Dashboard (Upload Pitches/Manifestos) */}
                <Route path="/campaigns/studio" element={<CandidateStudioPage />} />

                {/* F. Browse Video Pitches & Declarations per District */}
                <Route path="/campaigns/registry/:country/:districtId" element={<CampaignRegistryPage />} />

                {/* 🛠️ SPECIALIZED HIGH-LEVEL SECURITY PERMISSION PATHS */}
                {/* Restricts data modifications to explicitly vetted profile metrics [A] */}
                <Route element={<ProtectedRoute allowedRoles={['admin', 'moderator']} />}>

                  {/* Server-wide Administration & Governance Control Deck */}
                  <Route path="/kollective/admin" element={<AdminDashboardPage />} />

                  {/* Admin & Moderation Dashboards */}
                  <Route path="/admin/root" element={<RootAdminDashboard />} />
                  <Route path="/admin/moderation" element={<ModerationDashboard />} />

                  <Route path="/kollective/admin/candidacy" element={<CandidacyReviewPanel />} />

                  {/* Crowdsourced Election Deadlines Input Panel */}
                  <Route path="/campaigns/ledger-desk" element={<DeadlineManagerPage />} />

                </Route>

                {/* Dashboard where admin verifies accounts like activists, scholars, journalists, etc. need more work, will fix later */}
                <Route path="/admin/unified" element={<UnifiedAdminDashboard />} />
                {/* Dashboard where admins verify user's ID via video call, need more work, will fix later */}
                <Route path="/admin/video" element={<AdminVideoDashboard />} />

                {/* Verification & Onboarding Flows */}
                <Route path="/verify" element={<UnifiedOnboardingOrchestrator />} />
                <Route path="/verify/citizen" element={<CitizenVerificationDashboard />} />
                <Route path="/verify/jury/:applicationId" element={<ActivistJuryPortal />} />
                <Route path="/verify/dispute" element={<ScholarDisputePage />} />

              </Route>
            </Route>

            {/* 🛑 3. FALLBACK CATCH-ALL */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </BrowserRouter>
      </AlertProvider>
    </QueryClientProvider>
  );
}
