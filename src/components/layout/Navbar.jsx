import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, LogOut, Heart, Calendar, HelpCircle, Settings, Search, MessageSquare, Home, ChevronDown, Bell, ClipboardList, MapPin } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import greenLogo from '../../assets/greenlogo.webp';
import whitelogo from '../../assets/whitelogo.webp';
import { useAuth } from "../../context/AuthContext";
import { useWishlist } from "../../context/WishlistContext";
import { useLanguage } from "../../context/LanguageContext";
import LanguageDropdown from "../common/LanguageDropdown";
import UserMenu from "./UserMenu";
import NotificationPanel from "./NotificationPanel";
import { useNotifications } from "../../context/NotificationContext";

// =========================
// UNIFIED NAVBAR
// variant="landing" → transparent hero navbar (home page)
// variant="app"     → solid app navbar (all other pages)
// =========================

const Navbar = ({ variant = "app" }) => {
  const isLanding = variant === "landing";
  const { user, openAuthModal, signOut } = useAuth();
  const { totalSaved } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage, languages, currentLanguage, t } = useLanguage();
  const { unreadCount } = useNotifications();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const lastScrollY = useRef(0);

  const handleLogout = async () => {
    await signOut();
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  // Mobile detection (landing only — for hide/show logic)
  useEffect(() => {
    if (!isLanding) return;
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [isLanding]);

  // Scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setIsScrolled(y > (isLanding ? 50 : 10));

      if (isLanding) {
        if (y < 400) setIsVisible(true);
        else if (y > lastScrollY.current) setIsVisible(false);
        else setIsVisible(true);
        lastScrollY.current = y;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLanding]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset';
  }, [isMobileMenuOpen]);

  // Determine if center nav should show (app variant only)
  const path = location.pathname;
  const hideCenter = path.startsWith('/property') || path.startsWith('/unit') ||
    path.startsWith('/booking') || path === '/payment' || path === '/paid' ||
    path.startsWith('/application') || path === '/sign-lease' ||
    path.startsWith('/profile') || path === '/wishlist';

  // Color helpers for landing (transparent vs scrolled)
  const textColor = isLanding && !isScrolled ? 'text-white' : 'text-[#111827]';
  const hoverBg = isLanding && !isScrolled ? 'hover:bg-white/10' : 'hover:bg-black/5';
  const logo = isLanding && !isScrolled ? whitelogo : greenLogo;

  // Landing center links
  const landingLinks = [
    { name: t("nav.community"), path: '/#community' },
    { name: t("nav.pricing"), path: '/#living-spaces' },
    { name: t("nav.forBusinesses"), path: 'https://arrivio-business.vercel.app/' },
  ];

  // App center links (rolling cursor)
  const appLinks = [
    { name: t("nav.cities"), path: "/cities", icon: <MapPin size={14} /> },
    { name: t("nav.stays"), path: "/search", icon: <Home size={14} /> },
  ];

  // Shadow logic for app variant
  const showShadow = !isLanding && (isScrolled || path === '/wishlist' || path.startsWith('/profile') || path.startsWith('/property') || path.startsWith('/unit'));

  return (
    <>
      {/* ── NAVBAR ── */}
      {isLanding ? (
        <motion.nav
          initial={{ y: 0 }}
          animate={{ y: isMobile ? 0 : isVisible ? 0 : -120 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className={`fixed top-0 left-0 w-full z-[100] h-20 px-6 flex items-center justify-center
            ${isScrolled
              ? 'bg-[#f2f2f2]/90 backdrop-blur-xl border-b border-[#0f4c3a]/10'
              : 'bg-transparent'
            }
            ${isScrolled
              ? 'md:h-auto md:mt-4 md:px-12 md:bg-transparent md:backdrop-blur-none md:border-b-0'
              : 'md:h-20 md:mt-0 md:px-12 md:bg-transparent'
            }`}
        >
          <div className={`w-full mx-auto transition-all duration-500 ease-in-out flex items-center
            ${isScrolled
              ? 'md:bg-[#e8e8e8] md:shadow-sm md:py-3 md:px-8 md:rounded-full md:border md:border-white/40 md:max-w-7xl'
              : 'md:bg-transparent md:h-full md:px-0 md:max-w-7xl'
            }`}
          >
            <NavbarContent
              isLanding={isLanding}
              logo={logo}
              textColor={textColor}
              hoverBg={hoverBg}
              isScrolled={isScrolled}
              user={user}
              openAuthModal={openAuthModal}
              totalSaved={totalSaved}
              unreadCount={unreadCount}
              isNotifOpen={isNotifOpen}
              setIsNotifOpen={setIsNotifOpen}
              isMobileMenuOpen={isMobileMenuOpen}
              setIsMobileMenuOpen={setIsMobileMenuOpen}
              landingLinks={landingLinks}
              hideCenter={false}
              appLinks={appLinks}
              path={path}
              t={t}
            />
          </div>
        </motion.nav>
      ) : (
        <nav className={`${path === '/search' ? 'absolute' : 'fixed'} top-0 left-0 w-full z-[100] h-20 px-6 md:px-12 bg-[#f2f2f2]/90 backdrop-blur-xl transition-shadow duration-300 ${showShadow ? 'shadow-md' : 'shadow-none'} shadow-md`}>
          <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
            <NavbarContent
              isLanding={isLanding}
              logo={logo}
              textColor={textColor}
              hoverBg={hoverBg}
              isScrolled={isScrolled}
              user={user}
              openAuthModal={openAuthModal}
              totalSaved={totalSaved}
              unreadCount={unreadCount}
              isNotifOpen={isNotifOpen}
              setIsNotifOpen={setIsNotifOpen}
              isMobileMenuOpen={isMobileMenuOpen}
              setIsMobileMenuOpen={setIsMobileMenuOpen}
              landingLinks={landingLinks}
              hideCenter={hideCenter}
              appLinks={appLinks}
              path={path}
              t={t}
            />
          </div>
        </nav>
      )}

      {/* ── MOBILE DRAWER ── */}
      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        user={user}
        avatarError={avatarError}
        setAvatarError={setAvatarError}
        totalSaved={totalSaved}
        handleLogout={handleLogout}
        openAuthModal={openAuthModal}
        language={language}
        setLanguage={setLanguage}
        languages={languages}
        currentLanguage={currentLanguage}
        isLangMenuOpen={isLangMenuOpen}
        setIsLangMenuOpen={setIsLangMenuOpen}
        isLanding={isLanding}
        t={t}
      />
    </>
  );
};

// =========================
// NAVBAR CONTENT (shared between landing and app wrappers)
// =========================
const NavbarContent = ({
  isLanding, logo, textColor, hoverBg, isScrolled,
  user, openAuthModal, totalSaved, unreadCount,
  isNotifOpen, setIsNotifOpen,
  isMobileMenuOpen, setIsMobileMenuOpen,
  landingLinks, hideCenter, appLinks, path, t
}) => (
  <div className="flex items-center justify-between w-full">
    {/* LOGO */}
    <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="relative z-10 shrink-0 flex items-center">
      <img src={logo} alt="Arrivio" className="h-8 md:h-10 w-auto object-contain transition-all duration-500" />
    </Link>

    {/* CENTER */}
    {isLanding ? (
      <div className="hidden md:flex items-center gap-6 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {landingLinks.map((link) => {
          const isExternal = link.path.startsWith('http');
          const LinkComponent = isExternal ? 'a' : Link;
          const linkProps = isExternal ? { href: link.path } : { to: link.path };
          return (
            <LinkComponent
              key={link.name}
              {...linkProps}
              className={`px-6 py-2.5 rounded-full transition-all duration-300 font-sans text-[11px] font-medium uppercase tracking-[0.2em] border border-transparent
                ${isScrolled
                  ? 'text-[#111827] hover:bg-[#0f4c3a]/5 hover:text-[#1A2E22]'
                  : 'text-white hover:text-white/70'
                }`}
            >
              {link.name}
            </LinkComponent>
          );
        })}
      </div>
    ) : !hideCenter && (
      <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-full max-w-md items-center justify-center">
        <motion.div layout className="flex items-center p-1 bg-[#e8e8e8] border border-[#ddd] rounded-full shadow-sm">
          {appLinks.map((link) => {
            const isActive = path.startsWith(link.path);
            return (
              <Link key={link.name} to={link.path} className="relative px-6 py-2 rounded-full min-w-[140px] flex items-center justify-center">
                {isActive && (
                  <motion.div layoutId="rolling-cursor" className="absolute inset-0 bg-[#0f4c3a] rounded-full shadow-md" />
                )}
                <span className={`relative z-10 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest ${isActive ? "text-[#f2f2f2]" : "text-[#4b5563] hover:text-[#111827]"}`}>
                  {link.icon}
                  {link.name}
                </span>
              </Link>
            );
          })}
        </motion.div>
      </div>
    )}

    {/* RIGHT ACTIONS */}
    <div className="flex items-center gap-3 md:gap-2 shrink-0">
      <div className="hidden md:block">
        <LanguageDropdown className={isLanding && !isScrolled ? 'text-white' : undefined} />
      </div>

      {/* Wishlist */}
      <Link
        to="/wishlist"
        onClick={(e) => { if (!user) { e.preventDefault(); openAuthModal(); } }}
        className={`hidden md:flex items-center justify-center w-10 h-10 rounded-full ${hoverBg} transition-colors relative group`}
        title={t("nav.shortlist")}
      >
        <Heart size={20} className={`transition-colors ${isLanding && !isScrolled ? "text-white group-hover:text-red-400" : "text-[#111827] group-hover:text-red-500"}`} />
        {totalSaved > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#EA4335] text-[10px] font-bold text-white">
            {totalSaved > 9 ? '9+' : totalSaved}
          </span>
        )}
      </Link>

      {/* Notifications */}
      {user && (
        <div className="hidden md:flex items-center justify-center w-10 h-10 relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${hoverBg} ${textColor}`}
            title={t("nav.notifications")}
          >
            <Bell size={20} />
          </button>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#EA4335] text-[10px] font-bold text-white pointer-events-none">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          <NotificationPanel isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
        </div>
      )}

      {/* Auth */}
      {user ? (
        <div className="hidden md:block"><UserMenu /></div>
      ) : (
        <button
          onClick={openAuthModal}
          className={`group hidden md:flex items-center gap-2 px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 border
            ${isLanding && !isScrolled
              ? 'border-white bg-white/10 text-white backdrop-blur-md hover:bg-white hover:text-[#111827] shadow-lg hover:shadow-xl hover:scale-105'
              : 'border-transparent bg-[#0f4c3a] text-[#f2f2f2] hover:bg-[#1A2E22]'
            }`}
        >
          <User size={14} className={isLanding && !isScrolled ? "text-white group-hover:text-[#111827]" : "text-[#f2f2f2]"} />
          {t("nav.signIn")}
        </button>
      )}

      {/* Mobile hamburger */}
      <button
        className={`md:hidden p-2 transition-colors duration-500 ${isLanding && !isScrolled ? 'text-white' : 'text-[#111827]'}`}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X size={28} className="text-[#111827]" /> : <Menu size={28} />}
      </button>
    </div>
  </div>
);

// =========================
// MOBILE DRAWER (unified)
// =========================
const MobileDrawer = ({
  isOpen, onClose, user, avatarError, setAvatarError,
  totalSaved, handleLogout, openAuthModal,
  language, setLanguage, languages, currentLanguage,
  isLangMenuOpen, setIsLangMenuOpen, isLanding, t
}) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[110] md:hidden"
        />

        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 220 }}
          className="fixed top-0 right-0 h-full w-[300px] bg-white z-[120] shadow-2xl flex flex-col md:hidden"
        >
          {/* Header */}
          <div className="px-5 pt-5 pb-4 border-b border-[#f2f2f2] flex items-center justify-between">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0f4c3a] flex items-center justify-center overflow-hidden shrink-0">
                  {user.user_metadata?.avatar_url && !avatarError ? (
                    <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" onError={() => setAvatarError(true)} />
                  ) : (
                    <span className="text-sm font-serif text-white">{(user.user_metadata?.full_name || user.email || "?")[0]?.toUpperCase()}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-base font-bold text-[#111827] truncate">{user.user_metadata?.full_name?.split(' ')[0] || 'User'}</p>
                  <p className="text-xs text-[#9ca3af] truncate">{user.email}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm font-bold text-[#111827]">{t("nav.menu")}</p>
            )}
            <button onClick={onClose} className="p-2 rounded-full hover:bg-[#f2f2f2] transition-colors">
              <X size={18} className="text-[#6b7280]" />
            </button>
          </div>

          {/* Links */}
          <div className="flex-1 overflow-y-auto py-2">
            {/* Browse */}
            <div className="px-3 py-1">
              <p className="text-[13px] font-bold uppercase tracking-widest text-[#9ca3af] px-3 mb-2">{t("nav.browse")}</p>
              <DrawerLink to="/search" icon={Search} label={t("nav.searchStays")} onClick={onClose} />
              <DrawerLink to="/cities" icon={isLanding ? Home : MapPin} label={t("nav.cities")} onClick={onClose} />
              {isLanding && (
                <>
                  <DrawerLink to="/#community" icon={MessageSquare} label={t("nav.community")} onClick={onClose} />
                  <DrawerLink to="/#living-spaces" icon={Calendar} label={t("nav.pricing")} onClick={onClose} />
                </>
              )}
            </div>

            {/* Account */}
            {user && (
              <div className="px-3 py-1 border-t border-[#f2f2f2] mt-1">
                <p className="text-[13px] font-bold uppercase tracking-widest text-[#9ca3af] px-3 mb-2 mt-2.5">{t("nav.account")}</p>
                <DrawerLink to="/profile" icon={Home} label={t("nav.dashboard")} onClick={onClose} />
                <DrawerLink to="/profile/applications" icon={ClipboardList} label={t("nav.myApplications")} onClick={onClose} />
                <DrawerLink to="/profile/bookings" icon={Calendar} label={t("nav.myBookings")} onClick={onClose} />
                <DrawerLink to="/profile/wishlist" icon={Heart} label={t("nav.saved")} badge={totalSaved} onClick={onClose} />
                <DrawerLink to="/profile/payments" icon={Settings} label={t("nav.payments")} onClick={onClose} />
                <DrawerLink to="/profile/edit" icon={User} label={t("nav.personalDetails")} onClick={onClose} />
              </div>
            )}

            {/* Support */}
            <div className="px-3 py-1 border-t border-[#f2f2f2] mt-1">
              <p className="text-[13px] font-bold uppercase tracking-widest text-[#9ca3af] px-3 mb-2 mt-2.5">{t("nav.support")}</p>
              <DrawerLink to="/profile/settings-page" icon={Settings} label={t("nav.settings")} onClick={onClose} />
              <DrawerLink to="/profile/help" icon={HelpCircle} label={t("nav.helpSupport")} onClick={onClose} />
              <DrawerLink to="/contact" icon={MessageSquare} label={t("nav.contactUs")} onClick={onClose} />
            </div>

            {/* Log Out */}
            {user && (
              <div className="px-3 py-1 border-t border-[#f2f2f2] mt-1">
                <button onClick={handleLogout} className="flex items-center gap-4 px-3 py-3.5 rounded-xl hover:bg-red-50 active:bg-red-50 transition-colors w-full text-left">
                  <LogOut size={22} className="text-[#EA4335]" />
                  <span className="text-[16px] text-[#EA4335] font-medium">{t("nav.logOut")}</span>
                </button>
              </div>
            )}

            {/* Language */}
            <div className="px-3 py-1 border-t border-[#f2f2f2] mt-1">
              <p className="text-[13px] font-bold uppercase tracking-widest text-[#9ca3af] px-3 mb-2 mt-2.5">{t("nav.language")}</p>
              <div className="px-3 py-2">
                <div className="relative">
                  <button
                    onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-[#f7f7f7] rounded-xl text-left active:bg-[#f0f0f0] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img src={currentLanguage.flag} alt={currentLanguage.code} className="w-6 h-6 rounded-full object-cover shadow-sm" />
                      <span className="text-[17px] font-semibold text-[#111827]">{currentLanguage.label}</span>
                    </div>
                    <ChevronDown size={16} className={`text-[#9ca3af] transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {isLangMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="mt-1 bg-white rounded-xl border border-[#e5e7eb] shadow-lg overflow-hidden"
                      >
                        {languages.map(lang => (
                          <button
                            key={lang.code}
                            onClick={() => { setLanguage(lang.code); setIsLangMenuOpen(false); }}
                            className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${language === lang.code ? 'bg-[#0f4c3a]/5' : 'hover:bg-[#f7f7f7]'}`}
                          >
                            <div className="flex items-center gap-3">
                              <img src={lang.flag} alt={lang.code} className="w-5 h-5 rounded-full object-cover" />
                              <span className={`text-[15px] font-medium ${language === lang.code ? 'text-[#0f4c3a] font-semibold' : 'text-[#374151]'}`}>{lang.label}</span>
                            </div>
                            {language === lang.code && <div className="w-2 h-2 rounded-full bg-[#0f4c3a]" />}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          {/* Footer — Sign In for guests */}
          {!user && (
            <div className="px-5 py-5 border-t border-[#f2f2f2]">
              <button
                onClick={() => { onClose(); openAuthModal(); }}
                className="w-full py-3.5 bg-[#0f4c3a] text-white rounded-xl text-base font-bold uppercase tracking-widest active:scale-[0.98] transition-transform"
              >
                {t("nav.signIn")}
              </button>
            </div>
          )}
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

// =========================
// DRAWER LINK
// =========================
const DrawerLink = ({ to, icon: Icon, label, badge, onClick }) => (
  <Link to={to} onClick={onClick} className="flex items-center justify-between px-3 py-3.5 rounded-xl hover:bg-[#f7f7f7] active:bg-[#f2f2f2] transition-colors group">
    <div className="flex items-center gap-4">
      <Icon size={22} className="text-[#6b7280] group-hover:text-[#0f4c3a] transition-colors" />
      <span className="text-[16px] text-[#374151] group-hover:text-[#111827] font-medium">{label}</span>
    </div>
    {badge > 0 && (
      <span className="flex items-center justify-center rounded-full bg-[#EA4335] font-bold text-white" style={{ minWidth: '22px', height: '22px', fontSize: '12px', padding: '0 5px' }}>{badge > 9 ? '9+' : badge}</span>
    )}
  </Link>
);

export default Navbar;
