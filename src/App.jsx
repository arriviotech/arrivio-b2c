import React from "react";
import { BrowserRouter as Router, useLocation } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { WishlistProvider } from "./context/WishlistContext";
import { NotificationProvider } from "./context/NotificationContext";
import { LanguageProvider } from "./context/LanguageContext";

import Navbar from "./components/layout/Navbar";
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
    "/apply",
    "/demo-contract",
  ].includes(path);

  const isSuccessPage = path === "/booking-success";

  let navbarElement;

  if (isSuccessPage) {
    navbarElement = <SimpleNavbar />;
  } else if (isProcessPage) {
    navbarElement = null;
  } else if (path === "/") {
    navbarElement = <Navbar variant="landing" />;
  } else if (
    path.startsWith("/profile") || path.startsWith("/property") || path.startsWith("/unit") ||
    path.startsWith("/cities") || path.startsWith("/search") || path.startsWith("/wishlist") ||
    path.startsWith("/booking") || path === "/payment" || path === "/paid" ||
    path.startsWith("/application") || path === "/sign-lease"
  ) {
    navbarElement = <Navbar variant="app" />;
  } else {
    navbarElement = <SimpleNavbar />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f2f2f2]">
      {navbarElement}

      <main className="flex-grow">
        <AppRoutes />
      </main>

      {!isProcessPage && !isSuccessPage && !path.startsWith("/booking") && path !== "/payment" && path !== "/paid" && !path.startsWith("/application") && path !== "/sign-lease" && <Footer />}
      {!isProcessPage && !isSuccessPage && !path.startsWith("/booking") && path !== "/payment" && path !== "/paid" && !path.startsWith("/application") && path !== "/sign-lease" && <MobileNavbar />}
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

