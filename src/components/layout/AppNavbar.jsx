import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, Globe, MapPin, Home, X, Heart, User, LogOut, Calendar, HelpCircle, Settings, Search, MessageSquare, ChevronDown, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useWishlist } from "../../context/WishlistContext";
import { useLanguage } from "../../context/LanguageContext";
import LanguageDropdown from "../common/LanguageDropdown";
import UserMenu from "./UserMenu";
import NotificationPanel from "./NotificationPanel";
import { useNotifications } from "../../context/NotificationContext";
import greenLogo from '../../assets/greenlogo.png';

const AppNavbar = ({ property }) => {
  const { user, signOut, openAuthModal } = useAuth();
  const { totalSaved } = useWishlist();
  const { language, setLanguage, languages, currentLanguage } = useLanguage();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const { unreadCount } = useNotifications();
  const location = useLocation();


  const handleLogout = async () => {
    await signOut();
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "unset";
  }, [isMobileMenuOpen]);

  const links = [
    { name: "Cities", path: "/cities", icon: <MapPin size={14} /> },
    { name: "Stays", path: "/search", icon: <Home size={14} /> },
  ];

  return (
    <>
      <nav
        className={`${location.pathname === '/search' ? 'absolute' : 'fixed'} top-0 left-0 w-full z-[100] h-20 px-6 md:px-12 bg-[#f2f2f2]/90 backdrop-blur-xl transition-shadow duration-300 ${isScrolled || location.pathname === '/wishlist' || location.pathname.startsWith('/profile') || location.pathname.startsWith('/property') || location.pathname.startsWith('/unit') ? "shadow-md" : "shadow-none"
          } shadow-md`}
      >
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
          {/* LOGO */}
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center">
            <img
              src={greenLogo}
              alt="Arrivio"
              className="h-8 md:h-10 w-auto object-contain transition-all duration-500"
            />
          </Link>

          {/* CENTER NAV: SEARCH OR LINKS */}
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-full max-w-md items-center justify-center">
            {location.pathname.startsWith('/property') || location.pathname.startsWith('/unit') ? (
              null
            ) : (!location.pathname.startsWith('/profile') && location.pathname !== '/wishlist' && (
              /* STANDARD ROLLING LINKS */
              <motion.div
                layout
                className="flex items-center p-1 bg-[#e8e8e8] border border-[#ddd] rounded-full shadow-sm"
              >
                {links.map((link) => {
                  const isActive = location.pathname.startsWith(link.path);
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      className="relative px-6 py-2 rounded-full min-w-[140px] flex items-center justify-center"
                    >
                      {isActive && (
                        <motion.div
                          layoutId="rolling-cursor"
                          className="absolute inset-0 bg-[#0f4c3a] rounded-full shadow-md"
                        />
                      )}
                      <span
                        className={`relative z-10 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest ${isActive
                          ? "text-[#f2f2f2]"
                          : "text-[#4b5563] hover:text-[#111827]"
                          }`}
                      >
                        {link.icon}
                        {link.name}
                      </span>
                    </Link>
                  );
                })}
              </motion.div>
            ))}
          </div>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-3 md:gap-2">



            {/* LANGUAGE DROPDOWN */}
            <div className="hidden md:block">
              <LanguageDropdown />
            </div>

            {/* WISHLIST LINK */}
            <Link
              to="/wishlist"
              onClick={(e) => {
                if (!user) {
                  e.preventDefault();
                  openAuthModal();
                }
              }}
              className="hidden md:flex items-center justify-center w-10 h-10 rounded-full hover:bg-black/5 transition-colors relative group"
              title="Shortlist"
            >
              <Heart size={20} className="text-[#111827] group-hover:text-red-500 transition-colors" />
              {totalSaved > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#EA4335] text-[10px] font-bold text-white">
                  {totalSaved > 9 ? '9+' : totalSaved}
                </span>
              )}
            </Link>

            {/* NOTIFICATIONS BELL */}
            {user && (
              <div className="hidden md:flex items-center justify-center w-10 h-10 relative">
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-black/5 transition-colors"
                  title="Notifications"
                >
                  <Bell size={20} className="text-[#111827]" />
                </button>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#EA4335] text-[10px] font-bold text-white pointer-events-none">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
                <NotificationPanel isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
              </div>
            )}

            {/* ✅ AUTH AWARE BUTTON */}
            {user ? (
              <div className="hidden md:block">
                <UserMenu />
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="hidden md:flex items-center gap-2 px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#0f4c3a] text-[#f2f2f2] hover:bg-[#1A2E22] transition-colors"
              >
                <User size={14} className="text-[#f2f2f2]" />
                Sign In
              </button>
            )}

            {/* MOBILE HAMBURGER — always show on mobile */}
            <button
              className="md:hidden p-2 ml-1"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={22} className="text-[#111827]" /> : <Menu size={22} className="text-[#111827]" />}
            </button>
          </div>
        </div>
      </nav >

      {/* MOBILE SIDE MENU DRAWER */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
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
                  <p className="text-sm font-bold text-[#111827]">Menu</p>
                )}
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-full hover:bg-[#f2f2f2] transition-colors">
                  <X size={18} className="text-[#6b7280]" />
                </button>
              </div>

              {/* Nav Links */}
              <div className="flex-1 overflow-y-auto py-2">
                {/* Browse */}
                <div className="px-3 py-1">
                  <p className="text-[13px] font-bold uppercase tracking-widest text-[#9ca3af] px-3 mb-2">Browse</p>
                  <MobileNavLink to="/search" icon={Search} label="Search Stays" onClick={() => setIsMobileMenuOpen(false)} />
                  <MobileNavLink to="/cities" icon={MapPin} label="Cities" onClick={() => setIsMobileMenuOpen(false)} />
                </div>

                {/* Account — only if logged in */}
                {user && (
                  <div className="px-3 py-1 border-t border-[#f2f2f2] mt-1">
                    <p className="text-[13px] font-bold uppercase tracking-widest text-[#9ca3af] px-3 mb-2 mt-2.5">Account</p>
                    <MobileNavLink to="/profile" icon={Home} label="Dashboard" onClick={() => setIsMobileMenuOpen(false)} />
                    <MobileNavLink to="/profile/bookings" icon={Calendar} label="My Bookings" onClick={() => setIsMobileMenuOpen(false)} />
                    <MobileNavLink to="/profile/wishlist" icon={Heart} label="Saved" badge={totalSaved} onClick={() => setIsMobileMenuOpen(false)} />
                    <MobileNavLink to="/profile/payments" icon={Settings} label="Payments" onClick={() => setIsMobileMenuOpen(false)} />
                    <MobileNavLink to="/profile/edit" icon={User} label="Personal Details" onClick={() => setIsMobileMenuOpen(false)} />
                  </div>
                )}

                {/* Support */}
                <div className="px-3 py-1 border-t border-[#f2f2f2] mt-1">
                  <p className="text-[13px] font-bold uppercase tracking-widest text-[#9ca3af] px-3 mb-2 mt-2.5">Support</p>
                  <MobileNavLink to="/profile/help" icon={HelpCircle} label="Help & Support" onClick={() => setIsMobileMenuOpen(false)} />
                  <MobileNavLink to="/contact" icon={MessageSquare} label="Contact Us" onClick={() => setIsMobileMenuOpen(false)} />
                </div>

                {/* Log Out — inside the nav */}
                {user && (
                  <div className="px-3 py-1 border-t border-[#f2f2f2] mt-1">
                    <button onClick={handleLogout} className="flex items-center gap-4 px-3 py-3.5 rounded-xl hover:bg-red-50 active:bg-red-50 transition-colors w-full text-left">
                      <LogOut size={22} className="text-[#EA4335]" />
                      <span className="text-[16px] text-[#EA4335] font-medium">Log Out</span>
                    </button>
                  </div>
                )}

                {/* Language — dropdown selector */}
                <div className="px-3 py-1 border-t border-[#f2f2f2] mt-1">
                  <p className="text-[13px] font-bold uppercase tracking-widest text-[#9ca3af] px-3 mb-2 mt-2.5">Language</p>
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

              {/* Footer — Sign In only for guests */}
              {!user && (
                <div className="px-5 py-5 border-t border-[#f2f2f2]">
                  <button
                    onClick={() => { setIsMobileMenuOpen(false); openAuthModal(); }}
                    className="w-full py-3.5 bg-[#0f4c3a] text-white rounded-xl text-base font-bold uppercase tracking-widest active:scale-[0.98] transition-transform"
                  >
                    Sign In
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

const MobileNavLink = ({ to, icon: Icon, label, badge, onClick }) => (
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

export default AppNavbar;

