import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { TransitionProvider } from "./context/TransitionContext";
import Layout from "./layout/Layout";
import PrivateRoute from "./components/PrivateRoute";
import PageTransition from "./components/PageTransition";
import { AnimatePresence } from "framer-motion";


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

        <AnimatePresence mode="popLayout" initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={
              <PageTransition layoutId="dashboard-page">
                <Dashboard />
              </PageTransition>
            } />

            <Route path="/trips" element={
              <PageTransition layoutId="module-trips">
                <Trips />
              </PageTransition>
            } />

            <Route path="/trips/new" element={
              <PageTransition layoutId="module-create-trip">
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
              <PageTransition layoutId="module-analytics">
                <Analytics />
              </PageTransition>
            } />

            <Route path="/reports" element={
              <PageTransition layoutId="module-reports">
                <Reports />
              </PageTransition>
            } />

            <Route path="/payment-history" element={
              <PageTransition layoutId="module-payments">
                <PaymentHistory />
              </PageTransition>
            } />

            <Route path="/expenses" element={
              <PageTransition layoutId="module-expenses">
                <DailyExpenses />
              </PageTransition>
            } />

            <Route path="/own-trips" element={
              <PageTransition layoutId="module-own">
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
              <PageTransition layoutId="module-admin">
                <AdminPanel />
              </PageTransition>
            } />

            <Route path="/courier" element={
              <PageTransition layoutId="module-courier">
                <CourierManagement />
              </PageTransition>
            } />

            {/* Fallback within authenticated app */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>

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
