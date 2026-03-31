import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, User, LogOut, Heart, Calendar, HelpCircle, CreditCard, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useWishlist } from "../../context/WishlistContext";

const UserMenu = ({ className = "" }) => {
    const { user, signOut } = useAuth();
    const { totalSaved } = useWishlist();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await signOut();
        setIsOpen(false);
        navigate("/");
    };

    if (!user) return null;

    const avatar = user.user_metadata?.avatar_url || user.user_metadata?.picture;
    const [imgError, setImgError] = useState(false);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border transition-all duration-300 hover:shadow-md ${className
                    ? className
                    : "bg-white border-[#ddd] text-[#111827] shadow-sm"
                    }`}
            >
                {avatar && !imgError ? (
                    <img src={avatar} alt="" className="w-8 h-8 rounded-full object-cover border border-[#ddd]" onError={() => setImgError(true)} />
                ) : (
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#0f4c3a] text-white text-xs font-bold uppercase">
                        {(user.user_metadata?.full_name || user.email || "U")[0].toUpperCase()}
                    </div>
                )}
                <Menu size={18} className="text-[#111827]" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-[#ddd] overflow-hidden z-50"
                    >
                        {/* Header — name + email only */}
                        <div className="px-5 py-4 border-b border-[#0f4c3a]/10">
                            <p className="text-sm font-bold text-[#111827] truncate">
                                {user.user_metadata?.full_name || "User"}
                            </p>
                            <p className="text-[11px] text-[#4b5563] truncate">
                                {user.email}
                            </p>
                        </div>

                        {/* Main actions */}
                        <div className="py-1">
                            <MenuItem icon={User} label="Profile" to="/profile" onClick={() => setIsOpen(false)} />
                            <MenuItem icon={Calendar} label="My Bookings" to="/profile/bookings" onClick={() => setIsOpen(false)} />
                            <MenuItem icon={CreditCard} label="Payments" to="/profile/payments" onClick={() => setIsOpen(false)} />
                            <MenuItem icon={Heart} label="Saved" to="/profile/wishlist" onClick={() => setIsOpen(false)} badge={totalSaved > 0 ? totalSaved : null} />
                        </div>

                        <div className="h-px bg-[#0f4c3a]/5 mx-4" />

                        {/* Support & Settings */}
                        <div className="py-1">
                            <MenuItem icon={Settings} label="Settings" to="/profile/settings-page" onClick={() => setIsOpen(false)} />
                            <MenuItem icon={HelpCircle} label="Help" to="/profile/help" onClick={() => setIsOpen(false)} />
                        </div>

                        <div className="h-px bg-[#0f4c3a]/5 mx-4" />

                        {/* Logout */}
                        <div className="py-1">
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 w-full px-5 py-2.5 text-sm text-[#EA4335] hover:bg-[#EA4335]/5 transition-colors"
                            >
                                <LogOut size={16} />
                                Log Out
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const MenuItem = ({ icon: Icon, label, to, onClick, badge }) => (
    <Link
        to={to}
        onClick={onClick}
        className="flex items-center justify-between px-5 py-3 text-sm font-medium text-[#111827] hover:bg-[#f2f2f2] transition-colors"
    >
        <div className="flex items-center gap-3">
            <Icon size={17} className="text-[#111827]" />
            {label}
        </div>
        {badge && (
            <span className="bg-red-500 text-white text-[9px] font-bold min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full">
                {badge}
            </span>
        )}
    </Link>
);

export default UserMenu;
