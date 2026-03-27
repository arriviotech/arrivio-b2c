import React from "react";
import { BrowserRouter as Router, useLocation } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { WishlistProvider } from "./context/WishlistContext";
import { NotificationProvider } from "./context/NotificationContext";
import { LanguageProvider } from "./context/LanguageContext";

import Navbar from "./components/layout/Navbar";
import AppNavbar from "./components/layout/AppNavbar";
import SimpleNavbar from "./components/layout/SimpleNavbar";
import Footer from "./components/layout/Footer";
import MobileNavbar from "./components/layout/MobileNavbar";
import ScrollToTop from "./components/common/ScrollToTop";

import AppRoutes from "./routes/AppRoutes";
import AuthModal from "./components/auth/AuthModal";

// =========================
// LAYOUT
// =========================
const Layout = () => {
  const location = useLocation();
  const path = location.pathname;

  const isProcessPage = [
    "/signin",
    "/application/details",
    "/apply",
    "/payment",
    "/demo-contract",
    "/booking/review",
    "/paid"
  ].includes(path);

  const isSuccessPage = path === "/booking-success";

  let CurrentNavbar;

  if (path.startsWith("/profile")) {
    CurrentNavbar = AppNavbar;
  } else if (isSuccessPage) {
    CurrentNavbar = SimpleNavbar;
  } else if (isProcessPage) {
    CurrentNavbar = () => null;
  } else if (path === "/") {
    CurrentNavbar = Navbar;
  } else if (path.startsWith("/property") || path.startsWith("/unit")) {
    CurrentNavbar = AppNavbar;
  } else if (path.startsWith("/cities") || path.startsWith("/search") || path.startsWith("/wishlist")) {
    CurrentNavbar = AppNavbar;
  } else {
    CurrentNavbar = SimpleNavbar;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f2f2f2]">
      <CurrentNavbar property={path.startsWith("/property") ? { id: path.split("/").pop() } : null} />

      <main className="flex-grow">
        <AppRoutes />
      </main>

      {!isProcessPage && !isSuccessPage && <Footer />}
      {!isProcessPage && !isSuccessPage && <MobileNavbar />}
    </div>
  );
};

// =========================
// APP ROOT
// =========================
function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <WishlistProvider>
            <NotificationProvider>
              <AuthModal />
              <ScrollToTop />
              <Layout />
            </NotificationProvider>
          </WishlistProvider>
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;

