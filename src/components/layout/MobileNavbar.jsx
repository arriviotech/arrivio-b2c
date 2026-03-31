import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Search, Heart, Bell, User, LayoutDashboard } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useWishlist } from "../../context/WishlistContext";
import { useNotifications } from "../../context/NotificationContext";
import NotificationPanel from "./NotificationPanel";

const MobileNavbar = () => {
    const location = useLocation();
    const path = location.pathname;
    const { t } = useLanguage();
    const { user, openAuthModal } = useAuth();
    const { totalSaved } = useWishlist();
    const { unreadCount } = useNotifications();
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const lastScrollY = useRef(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentY = window.scrollY;
            if (currentY < 50) { setIsVisible(true); }
            else if (currentY > lastScrollY.current + 5) { setIsVisible(false); setIsNotifOpen(false); }
            else if (currentY < lastScrollY.current - 5) { setIsVisible(true); }
            lastScrollY.current = currentY;
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Hide on property/unit detail pages (they have their own booking bottom bar)
    const isDetailPage = path.startsWith('/property/') || path.startsWith('/unit/');
    if (isDetailPage) return null;

    const navItems = [
        { icon: Home, label: t("nav.home"), path: "/" },
        { icon: Search, label: t("nav.search"), path: "/search" },
        { icon: Heart, label: t("nav.saved"), path: "/profile/wishlist", badge: totalSaved || 0, requireAuth: true },
        { icon: Bell, label: t("nav.alerts"), action: "notifications", badge: unreadCount || 0, requireAuth: true },
        { icon: user ? LayoutDashboard : User, label: user ? t("nav.account") : t("nav.signIn"), path: "/profile", requireAuth: true },
    ];

    const isActive = (item) => {
        if (item.action) return false;
        if (item.path === "/") return location.pathname === "/";
        if (item.path === "/profile/wishlist") return location.pathname === "/profile/wishlist";
        if (item.path === "/profile") return location.pathname.startsWith("/profile") && location.pathname !== "/profile/wishlist";
        return location.pathname.startsWith(item.path);
    };

    return (
        <>
            <div className={`md:hidden fixed left-0 right-0 z-[100] bg-[#f2f2f2] border-t border-[#e5e7eb] transition-transform duration-300 ${isVisible ? 'translate-y-0 bottom-0' : 'translate-y-full bottom-0'}`}>
                <div className="flex justify-around items-stretch">
                    {navItems.map((item) => {
                        const active = isActive(item);
                        const Icon = item.icon;

                        // Bell opens notification panel instead of navigating
                        if (item.action === "notifications") {
                            return (
                                <button
                                    key={item.label}
                                    onClick={() => {
                                        if (!user) { openAuthModal(); return; }
                                        setIsNotifOpen(!isNotifOpen);
                                    }}
                                    className={`relative flex flex-col items-center justify-center flex-1 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] transition-colors ${isNotifOpen ? "text-[#0f4c3a]" : "text-[#9ca3af]"}`}
                                >
                                    <div className="relative">
                                        <Icon size={28} strokeWidth={isNotifOpen ? 2.5 : 1.8} />
                                        {item.badge > 0 && (
                                            <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-[#EA4335] text-[11px] font-bold text-white">
                                                {item.badge > 9 ? '9+' : item.badge}
                                            </span>
                                        )}
                                    </div>
                                    <span className={`text-[13px] mt-1 font-semibold ${isNotifOpen ? "text-[#0f4c3a]" : "text-[#9ca3af]"}`}>
                                        {item.label}
                                    </span>
                                    {isNotifOpen && (
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-[3px] bg-[#0f4c3a] rounded-full" />
                                    )}
                                </button>
                            );
                        }

                        return (
                            <Link
                                key={item.label}
                                to={item.path}
                                onClick={(e) => {
                                    if (item.requireAuth && !user) {
                                        e.preventDefault();
                                        openAuthModal();
                                    }
                                    setIsNotifOpen(false);
                                }}
                                className={`relative flex flex-col items-center justify-center flex-1 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] transition-colors ${active ? "text-[#0f4c3a]" : "text-[#9ca3af]"}`}
                            >
                                <div className="relative">
                                    <Icon size={28} strokeWidth={active ? 2.5 : 1.8} />
                                    {item.badge > 0 && (
                                        <span className="absolute -top-2 -right-3 flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-[#EA4335] text-[11px] font-bold text-white">
                                            {item.badge > 9 ? '9+' : item.badge}
                                        </span>
                                    )}
                                </div>
                                <span className={`text-[13px] mt-1 font-semibold ${active ? "text-[#0f4c3a]" : "text-[#9ca3af]"}`}>
                                    {item.label}
                                </span>
                                {active && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-[3px] bg-[#0f4c3a] rounded-full" />
                                )}
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Notification Panel — slides up from bottom on mobile */}
            {isNotifOpen && (
                <div className="md:hidden fixed inset-0 z-[99]">
                    <div className="absolute inset-0 bg-black/20" onClick={() => setIsNotifOpen(false)} />
                    <div className="absolute bottom-20 left-2 right-2 [&>div]:!static [&>div]:!w-full [&>div]:!max-w-full [&>div]:!mt-0 [&>div]:max-h-[60vh] [&>div]:overflow-y-auto">
                        <NotificationPanel isOpen={true} onClose={() => setIsNotifOpen(false)} />
                    </div>
                </div>
            )}
        </>
    );
};

export default MobileNavbar;
