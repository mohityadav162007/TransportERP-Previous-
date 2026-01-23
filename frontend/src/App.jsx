import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
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

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={
          <PrivateRoute>
            <Layout>
              <PageTransition>
                <Dashboard />
              </PageTransition>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/trips" element={
          <PrivateRoute>
            <Layout>
              <PageTransition>
                <Trips />
              </PageTransition>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/trips/new" element={
          <PrivateRoute>
            <Layout>
              <PageTransition>
                <CreateTrip />
              </PageTransition>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/trips/edit/:id" element={
          <PrivateRoute>
            <Layout>
              <PageTransition>
                <EditTrip />
              </PageTransition>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/trips/:id" element={
          <PrivateRoute>
            <Layout>
              <PageTransition>
                <TripDetail />
              </PageTransition>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/analytics" element={
          <PrivateRoute>
            <Layout>
              <PageTransition>
                <Analytics />
              </PageTransition>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/reports" element={
          <PrivateRoute>
            <Layout>
              <PageTransition>
                <Reports />
              </PageTransition>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/payment-history" element={
          <PrivateRoute>
            <Layout>
              <PageTransition>
                <PaymentHistory />
              </PageTransition>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/expenses" element={
          <PrivateRoute>
            <Layout>
              <PageTransition>
                <DailyExpenses />
              </PageTransition>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/own-trips" element={
          <PrivateRoute>
            <Layout>
              <PageTransition>
                <OwnTrips />
              </PageTransition>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/analytics/party/:name" element={
          <PrivateRoute>
            <Layout>
              <PageTransition>
                <PartyDetail />
              </PageTransition>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/analytics/owner/:name" element={
          <PrivateRoute>
            <Layout>
              <PageTransition>
                <MotorOwnerDetail />
              </PageTransition>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/admin-panel" element={
          <PrivateRoute>
            <Layout>
              <PageTransition>
                <AdminPanel />
              </PageTransition>
            </Layout>
          </PrivateRoute>
        } />

        <Route path="/courier" element={
          <PrivateRoute>
            <Layout>
              <PageTransition>
                <CourierManagement />
              </PageTransition>
            </Layout>
          </PrivateRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
