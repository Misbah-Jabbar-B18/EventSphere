import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Register from './components/Auth/Register';
import Login from './components/Auth/Login';
import ResetPassword from './components/Auth/ResetPassword';
import Home from './pages/Home';
import Dashboard from './components/Dashboard/Dashboard';
import SystemSettingsPage from './components/Dashboard/SystemSettingsPage';
import NewAdminPage from './components/Dashboard/NewAdminPage';
import UpdateEventPage from './components/Dashboard/UpdateEventPage';
import RSVPListPage from './components/Events/RSVPListPage';
import QRScanPage from './components/Events/QRScanPage';
import OrganizerAnalyticsPage from './components/Dashboard/OrganizerAnalyticsPage';
import MyRsvpsPage from './components/Events/MyRsvpsPage';
 import MyQRs from './components/Events/QRScanPage';
import ScanQrPage from "./pages/ScanQrPage";
import EventQrPage from "./pages/EventQrPage";
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/system-settings" element={<SystemSettingsPage />} />
      <Route path="/new-admin" element={<NewAdminPage />} />
      <Route path="/update-event/:id" element={<UpdateEventPage />} />
      <Route path="/event/:id/guests" element={<RSVPListPage />} />
      <Route path="/event/:id/scan" element={<ScanQrPage />} />
      <Route path="/organizer/analytics" element={<OrganizerAnalyticsPage />} />
      <Route path="/my-rsvps" element={<MyRsvpsPage />} />
      <Route path="/qr-scan" element={<QRScanPage />} />
      <Route path="/my-qrs" element={<MyQRs />} />
      <Route path="/event/:eventId/scan" element={<ScanQrPage />} />
      <Route path="/scan-qr/:eventId" element={<ScanQrPage />} />
      <Route path="/event/:eventId/qr" element={<EventQrPage />} />
    </Routes>
  );
};

export default AppRoutes;
