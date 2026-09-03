import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { withAuth } from './components/auth/withAuth';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { CardEditorPage } from './pages/CardEditorPage';
import { PublicCardPage } from './pages/PublicCardPage';
import { ContactsPage } from './pages/ContactsPage';
import { ProfilePage } from './pages/ProfilePage';

const AnalyticsPage = lazy(async () => {
  const mod = await import('./pages/AnalyticsPage');
  return { default: mod.AnalyticsPage };
});

const GuardedDashboard = withAuth(DashboardPage);
const GuardedEditor = withAuth(CardEditorPage);
const GuardedContacts = withAuth(ContactsPage);
const GuardedAnalytics = withAuth(AnalyticsPage);
const GuardedProfile = withAuth(ProfilePage);

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/c/:slug" element={<PublicCardPage />} />
          <Route path="/dashboard" element={<GuardedDashboard />} />
          <Route path="/card/edit" element={<GuardedEditor />} />
          <Route path="/contacts" element={<GuardedContacts />} />
          <Route path="/analytics" element={<GuardedAnalytics />} />
          <Route path="/profile" element={<GuardedProfile />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
