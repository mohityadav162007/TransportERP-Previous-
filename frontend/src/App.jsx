import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { TransitionProvider } from "./context/TransitionContext";
import Layout from "./layout/Layout";
import PrivateRoute from "./components/PrivateRoute";
import PageTransition from "./components/PageTransition";


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

function AuthenticatedRoutes() {
  const location = useLocation();

  return (
    <PrivateRoute>
      <Layout>

        <Routes>
          <Route path="/" element={
            <PageTransition>
              <Dashboard />
            </PageTransition>
          } />

          <Route path="/trips" element={
            <PageTransition>
              <Trips />
            </PageTransition>
          } />

          <Route path="/trips/new" element={
            <PageTransition>
              <CreateTrip />
            </PageTransition>
          } />

          <Route path="/trips/edit/:id" element={
            <PageTransition>
              <EditTrip />
            </PageTransition>
          } />

          <Route path="/trips/:id" element={
            <PageTransition>
              <TripDetail />
            </PageTransition>
          } />

          <Route path="/analytics" element={
            <PageTransition>
              <Analytics />
            </PageTransition>
          } />

          <Route path="/reports" element={
            <PageTransition>
              <Reports />
            </PageTransition>
          } />

          <Route path="/payment-history" element={
            <PageTransition>
              <PaymentHistory />
            </PageTransition>
          } />

          <Route path="/expenses" element={
            <PageTransition>
              <DailyExpenses />
            </PageTransition>
          } />

          <Route path="/own-trips" element={
            <PageTransition>
              <OwnTrips />
            </PageTransition>
          } />

          <Route path="/analytics/party/:name" element={
            <PageTransition>
              <PartyDetail />
            </PageTransition>
          } />

          <Route path="/analytics/owner/:name" element={
            <PageTransition>
              <MotorOwnerDetail />
            </PageTransition>
          } />

          <Route path="/admin-panel" element={
            <PageTransition>
              <AdminPanel />
            </PageTransition>
          } />

          <Route path="/courier" element={
            <PageTransition>
              <CourierManagement />
            </PageTransition>
          } />

          {/* Fallback within authenticated app */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

      </Layout>
    </PrivateRoute >
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <TransitionProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            {/* All other routes are handled by AuthenticatedRoutes which includes Layout */}
            <Route path="/*" element={<AuthenticatedRoutes />} />
          </Routes>
        </TransitionProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}
