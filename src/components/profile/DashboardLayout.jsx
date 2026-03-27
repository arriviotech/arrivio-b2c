import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User, Heart, Calendar, CreditCard, HelpCircle,
  Mail, Phone, Globe, MapPin, ChevronRight, LogOut, Edit2, LayoutDashboard, FileText, Users, ShoppingBag
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useWishlist } from "../../context/WishlistContext";

import { supabase } from "../../supabase/client";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/profile", exact: true },
  { icon: Calendar, label: "My Bookings", path: "/profile/bookings" },
  { icon: CreditCard, label: "Payments", path: "/profile/payments" },
  { icon: FileText, label: "Documents", path: "/profile/documents" },
  { icon: Users, label: "Community", path: "/profile/community" },
  { icon: ShoppingBag, label: "Services", path: "/profile/services" },
  { icon: Heart, label: "Saved", path: "/profile/wishlist" },
  { icon: User, label: "Personal Details", path: "/profile/edit" },
  { icon: HelpCircle, label: "Help & Support", path: "/profile/help" },
];

const DashboardLayout = () => {
  const { user, signOut } = useAuth();
  const { wishlist, totalSaved } = useWishlist();
  const location = useLocation();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ applications: 0, bookings: 0 });

  useEffect(() => {
    if (!user) return;
    const fetchSidebar = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("phone, preferred_name, nationality, language")
        .eq("id", user.id)
        .maybeSingle();
      if (data) setProfile(data);

      const [appsRes, bookingsRes] = await Promise.all([
        supabase.from("applications").select("id", { count: "exact", head: true }).eq("profile_id", user.id),
        supabase.from("bookings").select("id", { count: "exact", head: true }).eq("profile_id", user.id),
      ]);
      setStats({ applications: appsRes.count || 0, bookings: bookingsRes.count || 0 });
    };
    fetchSidebar();
  }, [user]);

  if (!user) return null;

  const name = user.user_metadata?.full_name || "User";
  const avatar = user.user_metadata?.avatar_url || user.user_metadata?.picture;
  const [avatarError, setAvatarError] = useState(false);
  const memberSince = new Date(user.created_at).toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  const formatPhone = (phone) => {
    if (!phone) return "Not set";
    const codes = ["+971", "+49", "+91", "+44", "+61", "+65", "+1"];
    const code = codes.find(c => phone.startsWith(c));
    return code ? `${code} ${phone.slice(code.length)}` : phone;
  };

  const getBadge = (path) => {
    if (path === "/profile/bookings" && stats.applications > 0) return stats.applications;
    if (path === "/profile/wishlist" && totalSaved > 0) return totalSaved;
    return null;
  };

  return (
    <div className="min-h-screen bg-[#f2f2f2] font-sans text-[#111827]">
      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-24 md:pt-28 pb-24 md:pb-20">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">

          {/* ════════ LEFT SIDEBAR (hidden on mobile — MobileNavbar handles nav) ════════ */}
          <div className="hidden md:block md:w-[280px] shrink-0">
            <div className="space-y-5">

              {/* Avatar Card */}
              <div className="bg-white rounded-2xl border border-[#e5e7eb] p-6 text-center">
                <div className="mb-3">
                  {avatar && !avatarError ? (
                    <img src={avatar} alt={name} className="w-18 h-18 rounded-full object-cover border-2 border-white shadow-lg mx-auto" style={{ width: 72, height: 72 }} onError={() => setAvatarError(true)} />
                  ) : (
                    <div className="w-[72px] h-[72px] rounded-full bg-[#0f4c3a] text-white flex items-center justify-center text-2xl font-serif shadow-lg mx-auto">
                      {name[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <h2 className="font-serif text-lg text-[#111827] mb-0.5">{name}</h2>
                <p className="text-[11px] text-[#6b7280]">Member since {memberSince}</p>
                {profile?.nationality && (
                  <p className="text-[11px] text-[#6b7280]">{profile.nationality}</p>
                )}
              </div>

              {/* Stats */}
              <div className="bg-white rounded-2xl border border-[#e5e7eb] p-4">
                <p className="text-[9px] font-bold uppercase tracking-widest text-[#9ca3af] mb-3">Activity</p>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#374151]">Applications</span>
                    <span className="text-xs font-bold text-[#111827]">{stats.applications}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#374151]">Bookings</span>
                    <span className="text-xs font-bold text-[#111827]">{stats.bookings}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#374151]">Saved</span>
                    <span className="text-xs font-bold text-[#111827]">{totalSaved}</span>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="bg-white rounded-2xl border border-[#e5e7eb] overflow-hidden">
                {NAV_ITEMS.map((item, i) => {
                  const isActive = location.pathname === item.path;
                  const badge = getBadge(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center justify-between px-4 py-3 transition-colors group ${
                        i < NAV_ITEMS.length - 1 ? "border-b border-[#e5e7eb]" : ""
                      } ${isActive ? "bg-[#0f4c3a]/5" : "hover:bg-[#f7f7f7]"}`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon size={15} className={`${isActive ? "text-[#0f4c3a]" : "text-[#9ca3af] group-hover:text-[#0f4c3a]"} transition-colors`} />
                        <span className={`text-sm ${isActive ? "font-bold text-[#0f4c3a]" : "font-medium text-[#374151]"}`}>{item.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {badge && (
                          <span className="bg-[#0f4c3a] text-white text-[8px] font-bold min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full">
                            {badge}
                          </span>
                        )}
                        <ChevronRight size={14} className={`${isActive ? "text-[#0f4c3a]" : "text-[#d1d5db]"}`} />
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Account Info */}
              <div className="bg-white rounded-2xl border border-[#e5e7eb] p-4">
                <p className="text-[9px] font-bold uppercase tracking-widest text-[#9ca3af] mb-3">Account</p>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <Mail size={13} className="text-[#d1d5db] shrink-0" />
                    <span className="text-xs text-[#374151] truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Phone size={13} className="text-[#d1d5db] shrink-0" />
                    <span className={`text-xs truncate ${profile?.phone ? "text-[#374151]" : "text-[#d1d5db] italic"}`}>
                      {formatPhone(profile?.phone)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Globe size={13} className="text-[#d1d5db] shrink-0" />
                    <span className="text-xs text-[#374151]">{profile?.language === "de" ? "Deutsch" : "English"}</span>
                  </div>
                </div>
              </div>

              {/* Log Out */}
              <button
                onClick={async () => { await signOut(); navigate("/"); }}
                className="w-full flex items-center justify-center gap-2 py-3 text-xs font-bold text-[#EA4335]/70 hover:text-[#EA4335] transition-colors rounded-2xl hover:bg-[#EA4335]/5"
              >
                <LogOut size={14} />
                Log out
              </button>
            </div>
          </div>

          {/* ════════ RIGHT CONTENT (changes per route) ════════ */}
          <div className="flex-1 min-w-0 min-h-[60vh]">
            <Outlet />
          </div>

        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
