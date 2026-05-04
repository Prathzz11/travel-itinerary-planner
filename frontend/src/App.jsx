import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/layout/Layout';

import { AuthProvider } from './contexts/AuthContext';
import { TripProvider } from './contexts/TripContext';
import { ItineraryProvider } from './contexts/ItineraryContext';
import { BookingProvider } from './contexts/BookingContext';
import { ExpenseProvider } from './contexts/ExpenseContext';
import { ExploreProvider } from './contexts/ExploreContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { useAuth } from './hooks/useAuth';
import NotificationContainer from './components/ui/NotificationContainer';

import { Suspense, lazy } from 'react';

// Pages (Lazy Loaded for Performance)
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CreateTrip = lazy(() => import('./pages/CreateTrip'));
const TripDetail = lazy(() => import('./pages/TripDetail'));
const Itinerary = lazy(() => import('./pages/Itinerary'));
const BudgetPage = lazy(() => import('./pages/BudgetPage'));
const BrowseItineraries = lazy(() => import('./pages/BrowseItineraries'));
const ExistingItineraryDetail = lazy(() => import('./pages/ExistingItineraryDetail'));
const ForkItinerary = lazy(() => import('./pages/ForkItinerary'));
const MyTemplates = lazy(() => import('./pages/MyTemplates'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const MembersPage = lazy(() => import('./pages/MembersPage'));
const BookingsPage = lazy(() => import('./pages/BookingsPage'));
const SettlementsPage = lazy(() => import('./pages/SettlementsPage'));
const MapPage = lazy(() => import('./pages/MapPage'));
const PublicProfile = lazy(() => import('./pages/PublicProfile'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const Careers = lazy(() => import('./pages/Careers'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const NotFound = lazy(() => import('./pages/NotFound'));

import LoadingSpinner from './components/ui/LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  
  if (loading) return null; // Or a loading spinner
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // If user doesn't have the required role, send them to dashboard or home
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
      <ExploreProvider>
        <TripProvider>
          <ItineraryProvider>
            <BookingProvider>
              <ExpenseProvider>
                <Router>
                  <Routes>
                <Route path="/" element={<Layout />}>
                  {/* Wrap Routes with Suspense for lazy loading fallback */}
                  <Route element={<Suspense fallback={<div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><LoadingSpinner /></div>}><Outlet /></Suspense>}>
                    {/* Public */}
                    <Route index element={<Home />} />
                    <Route path="login" element={<Login />} />
                    <Route path="signup" element={<Signup />} />
                    <Route path="explore" element={<BrowseItineraries />} />
                    <Route path="itinerary/:id" element={<ExistingItineraryDetail />} />
                    <Route path="user/:id" element={<PublicProfile />} />
                    <Route path="about" element={<AboutUs />} />
                    <Route path="careers" element={<Careers />} />
                    <Route path="privacy" element={<PrivacyPolicy />} />
                    <Route path="terms" element={<TermsOfService />} />
                    
                    {/* Protected */}
                    <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="create-trip" element={<ProtectedRoute><CreateTrip /></ProtectedRoute>} />
                    <Route path="trip/:id" element={<ProtectedRoute><TripDetail /></ProtectedRoute>} />
                    <Route path="trip/:id/itinerary" element={<ProtectedRoute><Itinerary /></ProtectedRoute>} />
                    <Route path="trip/:id/map" element={<ProtectedRoute><MapPage /></ProtectedRoute>} />
                    <Route path="trip/:id/budget" element={<ProtectedRoute><BudgetPage /></ProtectedRoute>} />
                    <Route path="trip/:id/settlements" element={<ProtectedRoute><SettlementsPage /></ProtectedRoute>} />
                    <Route path="trip/:id/members" element={<ProtectedRoute><MembersPage /></ProtectedRoute>} />
                    <Route path="trip/:id/bookings" element={<ProtectedRoute><BookingsPage /></ProtectedRoute>} />
                    <Route path="fork/:id" element={<ProtectedRoute><ForkItinerary /></ProtectedRoute>} />
                    <Route path="my-templates" element={<ProtectedRoute><MyTemplates /></ProtectedRoute>} />
                    <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                    
                    {/* Catch-all 404 Route */}
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Route>
              </Routes>
              <NotificationContainer />
            </Router>
            </ExpenseProvider>
          </BookingProvider>
        </ItineraryProvider>
        </TripProvider>
      </ExploreProvider>
    </AuthProvider>
    </NotificationProvider>
  );
}

export default App;
