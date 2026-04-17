import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import TripDetail from './pages/TripDetail.jsx';
import Itinerary from './pages/Itinerary.jsx';
import BudgetPage from './pages/BudgetPage.jsx';
import BrowseItineraries from './pages/BrowseItineraries.jsx';
import ExistingItineraryDetail from './pages/ExistingItineraryDetail.jsx';
import ForkItinerary from './pages/ForkItinerary.jsx';
import MyTemplates from './pages/MyTemplates.jsx';

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/browse" element={<BrowseItineraries />} />
        <Route path="/itineraries/:id" element={<ExistingItineraryDetail />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/trips/:id" element={<PrivateRoute><TripDetail /></PrivateRoute>} />
        <Route path="/trips/:id/itinerary" element={<PrivateRoute><Itinerary /></PrivateRoute>} />
        <Route path="/trips/:id/budget" element={<PrivateRoute><BudgetPage /></PrivateRoute>} />
        <Route path="/fork/:id" element={<PrivateRoute><ForkItinerary /></PrivateRoute>} />
        <Route path="/my-templates" element={<PrivateRoute><MyTemplates /></PrivateRoute>} />
      </Routes>
    </>
  );
}
