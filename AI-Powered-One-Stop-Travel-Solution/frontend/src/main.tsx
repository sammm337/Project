import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import './styles/globals.css';
import App from './App';
import TravelerSearch from './pages/TravelerSearch';
import Recommendations from './pages/Recommendations';
import ItineraryView from './pages/ItineraryView';
import VendorDashboard from './pages/VendorDashboard';
import VendorCreatePackage from './pages/VendorCreatePackage';
import AgencyEvents from './pages/AgencyEvents';
import BookingFlow from './pages/BookingFlow';
import Home from './pages/Home';
import Auth from './pages/Auth';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'search', element: <TravelerSearch /> },
      { path: 'recommendations', element: <Recommendations /> },
      { path: 'itinerary', element: <ItineraryView /> },
      { path: 'vendor/dashboard', element: <VendorDashboard /> },
      { path: 'vendor/create', element: <VendorCreatePackage /> },
      { path: 'agency/events', element: <AgencyEvents /> },
      { path: 'booking', element: <BookingFlow /> },
      { path: 'auth',element: <Auth />}
    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

