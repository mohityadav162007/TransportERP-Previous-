import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./layout/Layout";
import PrivateRoute from "./components/PrivateRoute";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Trips from "./pages/Trips";
import CreateTrip from "./pages/CreateTrip";
import EditTrip from "./pages/EditTrip";
import TripDetail from "./pages/TripDetail";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import PaymentHistory from "./pages/PaymentHistory";
import DailyExpenses from "./pages/DailyExpenses";
import OwnTrips from "./pages/OwnTrips";
import PartyDetail from "./pages/PartyDetail";
import MotorOwnerDetail from "./pages/MotorOwnerDetail";
import AdminPanel from "./pages/AdminPanel";
import CourierManagement from "./pages/CourierManagement";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/trips" element={
            <PrivateRoute>
              <Layout>
                <Trips />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/trips/new" element={
            <PrivateRoute>
              <Layout>
                <CreateTrip />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/trips/edit/:id" element={
            <PrivateRoute>
              <Layout>
                <EditTrip />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/trips/:id" element={
            <PrivateRoute>
              <Layout>
                <TripDetail />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/analytics" element={
            <PrivateRoute>
              <Layout>
                <Analytics />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/reports" element={
            <PrivateRoute>
              <Layout>
                <Reports />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/payment-history" element={
            <PrivateRoute>
              <Layout>
                <PaymentHistory />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/expenses" element={
            <PrivateRoute>
              <Layout>
                <DailyExpenses />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/own-trips" element={
            <PrivateRoute>
              <Layout>
                <OwnTrips />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/analytics/party/:name" element={
            <PrivateRoute>
              <Layout>
                <PartyDetail />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/analytics/owner/:name" element={
            <PrivateRoute>
              <Layout>
                <MotorOwnerDetail />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/admin-panel" element={
            <PrivateRoute>
              <Layout>
                <AdminPanel />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/courier" element={
            <PrivateRoute>
              <Layout>
                <CourierManagement />
              </Layout>
            </PrivateRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
