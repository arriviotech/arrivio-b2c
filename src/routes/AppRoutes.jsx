import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/auth/ProtectedRoute";

// =========================
// PAGES (LAZY LOADED)
// =========================
import Landing from "../pages/Landing"; // Keep Landing eager for LCP

// Auth
const SignIn = React.lazy(() => import("../pages/auth/SignIn"));
const AuthCallback = React.lazy(() => import("../pages/auth/AuthCallback")); // Renamed & Moved

// Business
const Careers = React.lazy(() => import("../pages/business/Careers"));
const Contact = React.lazy(() => import("../pages/business/Contact"));

// Legal
const Privacy = React.lazy(() => import("../pages/legal/Privacy"));
const Terms = React.lazy(() => import("../pages/legal/Terms"));
const Imprint = React.lazy(() => import("../pages/legal/Imprint"));

// Booking
const BookingReview = React.lazy(() => import("../pages/booking/BookingReview"));
const BookingSuccess = React.lazy(() => import("../pages/booking/BookingSuccess"));
const PaymentPage = React.lazy(() => import("../pages/booking/PaymentPage"));
const Paid = React.lazy(() => import("../pages/booking/Paid"));
const SignLease = React.lazy(() => import("../pages/booking/SignLease"));

// Main App
const CityGridPage = React.lazy(() => import("../pages/CityGridPage"));
const Search = React.lazy(() => import("../pages/Search"));
const PropertyDetails = React.lazy(() => import("../pages/PropertyDetails"));
const UnitDetails = React.lazy(() => import("../pages/UnitDetails"));
import Profile from "../pages/Profile";
import DashboardLayout from "../components/profile/DashboardLayout";
import EditProfile from "../pages/profile/EditProfile";
import MyApplications from "../pages/profile/MyApplications";
import MyBookings from "../pages/profile/MyBookings";
import MyPayments from "../pages/profile/MyPayments";
import Help from "../pages/profile/Help";
import Documents from "../pages/profile/Documents";
import Community from "../pages/profile/Community";
import Services from "../pages/profile/Services";
import BookingDetail from "../pages/profile/BookingDetail";
import SettingsPage from "../pages/profile/SettingsPage";
import ApplicationDetail from "../pages/profile/ApplicationDetail";
import UserDetails from "../pages/UserDetails";
import Wishlist from "../pages/Wishlist";
const NotFound = React.lazy(() => import("../pages/NotFound"));


import PageLoader from "../components/common/PageLoader";

const ExternalRedirect = ({ url }) => {
    React.useEffect(() => {
        window.location.href = url;
    }, [url]);
    return <PageLoader />;
};

const AppRoutes = () => {
    return (
        <Suspense fallback={<PageLoader />}>
            <Routes>
                {/* ================= PUBLIC ROUTES ================= */}
                <Route path="/" element={<Landing />} />
                <Route path="/search" element={<Search />} />
                <Route path="/property/:slug" element={<PropertyDetails />} />
                <Route path="/unit/:slug" element={<UnitDetails />} />
                <Route path="/cities" element={<CityGridPage />} />

                {/* AUTH */}
                <Route path="/login" element={<SignIn />} />
                <Route path="/signup" element={<SignIn />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/auth/callback" element={<AuthCallback />} />

                {/* BUSINESS (EXTERNAL REDIRECTS) */}
                <Route path="/business" element={<ExternalRedirect url="https://arrivio-business.vercel.app/" />} />
                <Route path="/employers" element={<ExternalRedirect url="https://arrivio-business.vercel.app/" />} />
                <Route path="/careers" element={<Careers />} />
                <Route path="/contact" element={<Contact />} />

                {/* LEGAL */}
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/imprint" element={<Imprint />} />

                {/* PROTECTED USER ROUTES — Dashboard Layout */}
                <Route path="/profile" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                    <Route index element={<Profile />} />
                    <Route path="edit" element={<EditProfile />} />
                    <Route path="wishlist" element={<Wishlist />} />
                    <Route path="applications" element={<MyApplications />} />
                    <Route path="bookings" element={<MyBookings />} />
                    <Route path="payments" element={<MyPayments />} />
                    <Route path="documents" element={<Documents />} />
                    <Route path="community" element={<Community />} />
                    <Route path="services" element={<Services />} />
                    <Route path="bookings/:id" element={<BookingDetail />} />
                    <Route path="applications/:id" element={<ApplicationDetail />} />
                    <Route path="help" element={<Help />} />
                    <Route path="settings-page" element={<SettingsPage />} />
                </Route>

                <Route path="/wishlist" element={<Navigate to="/profile/wishlist" replace />} />
                <Route path="/application/details" element={<ProtectedRoute><UserDetails /></ProtectedRoute>} />

                {/* BOOKING PROCESS */}
                <Route path="/booking/review" element={<ProtectedRoute><BookingReview /></ProtectedRoute>} />
                <Route path="/payment" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
                <Route path="/booking-success" element={<ProtectedRoute><BookingSuccess /></ProtectedRoute>} />
                <Route path="/paid" element={<ProtectedRoute><Paid /></ProtectedRoute>} />
                <Route path="/sign-lease" element={<ProtectedRoute><SignLease /></ProtectedRoute>} />


                {/* ================= 404 CATCH-ALL ================= */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Suspense>
    );
};

export default AppRoutes;
