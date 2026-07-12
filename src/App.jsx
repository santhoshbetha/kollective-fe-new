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
import { PollsPage } from './pages/PollsPage';
import { CreatePollPage } from './pages/CreatePollPage';
import { BusinessProposalDetailsPage } from './pages/BusinessProposalDetailsPage';
import { SettingsPage } from './pages/SettingsPage';
import { EditProfilePage } from './pages/EditProfilePage';
import { BookmarksPage } from './pages/BookmarksPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ExplorePage } from './pages/ExplorePage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { UserProfilePage } from './pages/UserProfilePage';
import RootAdminDashboard from './pages/admin/RootAdminDashboard';
import ModerationDashboard from './pages/admin/ModerationDashboard';
import UnifiedOnboardingOrchestrator from './pages/UnifiedOnboardingOrchestrator';
import CitizenVerificationDashboard from './pages/CitizenVerificationDashboard';
import ActivistJuryPortal from './components/ActivistJuryPortal';
import UnifiedAdminDashboard from './pages/admin/UnifiedAdminDashboard';
import AdminVideoDashboard from './pages/admin/AdminVideoDashboard';
import ProfilePageDemo from './pages/ProfilePageDemo';
import ScholarDisputePage from './pages/ScholarDisputePage';

// Guard & Layout Wrappers
import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './components/MainLayout';


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* 🌍 1. PUBLIC ROUTES (No Auth Required) */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* 🔒 2. PRIVATE APPS (Auth Verified Layout Group) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              {/* App Dashboard Pages */}
              <Route path="/home" element={<HomePage />} />
              <Route path="/communities" element={<CommunitiesPage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/bookmarks" element={<BookmarksPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />

              {/* Organize Flow */}
              <Route path="/organize" element={<OrganizePage />} />
              <Route path="/organize/create" element={<CreateActionPage />} />
              <Route path="/organize/:id" element={<ActionDetailsPage />} />
              <Route path="/post/:id" element={<PostDetailsPage />} />

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

              {/* Polls Routes */}
              <Route path="/polls" element={<PollsPage />} />
              <Route path="/polls/create" element={<CreatePollPage />} />

              {/* Account Management */}
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/settings/profile" element={<EditProfilePage />} />
              <Route path="/profile/:username" element={<UserProfilePage />} />
              <Route path="/profile-demo" element={<ProfilePageDemo />} />

              {/* Verification & Onboarding Flows */}
              <Route path="/verify" element={<UnifiedOnboardingOrchestrator />} />
              <Route path="/verify/citizen" element={<CitizenVerificationDashboard />} />
              <Route path="/verify/jury/:applicationId" element={<ActivistJuryPortal />} />
              <Route path="/verify/dispute" element={<ScholarDisputePage />} />

              {/* Admin & Moderation Dashboards */}
              <Route path="/admin/root" element={<RootAdminDashboard />} />
              <Route path="/admin/moderation" element={<ModerationDashboard />} />
              <Route path="/admin/unified" element={<UnifiedAdminDashboard />} />
              <Route path="/admin/video" element={<AdminVideoDashboard />} />
            </Route>
          </Route>

          {/* 🛑 3. FALLBACK CATCH-ALL */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
