import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    MapPin,
    Calendar,
    CheckCircle,
    AlertCircle,
    Clock,
    ArrowRight,
    Home,
    Loader,
    Timer,
    XCircle
} from 'lucide-react';
import { supabase } from '../../supabase/client';
import { useAuth } from '../../context/AuthContext';

// 48-hour countdown timer component
const CountdownTimer = ({ createdAt, onExpire }) => {
    const [timeLeft, setTimeLeft] = useState('');
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        const deadline = new Date(createdAt).getTime() + 48 * 60 * 60 * 1000; // 48 hours

        const update = () => {
            const now = Date.now();
            const diff = deadline - now;

            if (diff <= 0) {
                setIsExpired(true);
                setTimeLeft('Expired');
                onExpire?.();
                return;
            }

            const hrs = Math.floor(diff / (1000 * 60 * 60));
            const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const secs = Math.floor((diff % (1000 * 60)) / 1000);
            setTimeLeft(`${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
        };

        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [createdAt]);

    return (
        <div className={`flex items-center gap-1 text-xs font-bold tabular-nums ${isExpired ? 'text-red-500' : 'text-amber-600'
            }`}>
            <Timer size={12} />
            <span>{timeLeft}</span>
        </div>
    );
};

const MyApplications = ({ navigate, setOneCount }) => {
    const { user } = useAuth();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchApplications = async () => {
            try {
                const { data, error } = await supabase
                    .from('applications')
                    .select(`
                        *,
                        units!unit_id (
                            id,
                            unit_number,
                            unit_type,
                            properties (
                                id,
                                name,
                                slug,
                                city,
                                district
                            ),
                            unit_pricing_rules (
                                monthly_rent_cents
                            )
                        )
                    `)
                    .eq('profile_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                const apps = data || [];
                setApplications(apps);
                if (setOneCount) setOneCount(apps.length); // ✅ UPDATE COUNT
            } catch (err) {
                console.error('Error fetching applications:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, [user, setOneCount]);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20 text-[#9ca3af]">
                <Loader className="animate-spin" size={32} />
            </div>
        );
    }

    if (applications.length === 0) {
        return (
            <div className="bg-white rounded-[2.5rem] border border-[#0f4c3a]/5 p-20 text-center shadow-sm flex flex-col items-center justify-center gap-6">
                <div className="w-24 h-24 bg-[#f0f0f0] rounded-full flex items-center justify-center text-[#111827]/20 mb-2">
                    <Home size={40} />
                </div>
                <div>
                    <h3 className="text-2xl font-serif text-[#111827] mb-2">No applications yet</h3>
                    <p className="text-[#4b5563] max-w-md mx-auto leading-relaxed">You haven't applied for any properties yet. Start exploring our currated collection of premium homes.</p>
                </div>
                <button
                    onClick={() => navigate('/search')}
                    className="mt-4 px-8 py-4 bg-[#0f4c3a] text-[#f2f2f2] rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-[#0a3a2b] transition-transform hover:scale-105 shadow-xl shadow-[#0f4c3a]/20"
                >
                    Explore Properties
                </button>
            </div>
        );
    }

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'success':
            case 'paid':
                return 'bg-green-100/50 text-green-700 border-green-200';
            case 'cancelled':
                return 'bg-red-50 text-red-600 border-red-100';
            case 'refunded':
                return 'bg-gray-100 text-gray-600 border-gray-200';
            case 'in progress':
            case 'pending':
            default:
                return 'bg-yellow-50 text-yellow-700 border-yellow-100';
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {applications.map((app, index) => (
                <ApplicationCard key={app.id} app={app} index={index} navigate={navigate} getStatusColor={getStatusColor} />
            ))}
        </div>
    );
};

// Extracted card component (hooks must be at top level)
const ApplicationCard = ({ app, index, navigate, getStatusColor }) => {
    const [expired, setExpired] = useState(false);
    const unit = app.units || {};
    const property = unit.properties || {};
    const pricingRule = (unit.unit_pricing_rules || [])[0];
    const coverImage = "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80";
    const monthlyPrice = pricingRule ? Math.round(pricingRule.monthly_rent_cents / 100) : 0;

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            onClick={() => !expired && navigate("/application/details", {
                state: {
                    ...app,
                    applicationId: app.id,
                    title: property.name || "Untitled Property",
                    image: coverImage,
                    city: property.city || "Germany",
                    checkIn: app.move_in_date,
                    checkOut: app.move_out_date,
                    monthlyTotal: monthlyPrice,
                }
            })}
            className={`group bg-white rounded-2xl border shadow-sm transition-all duration-300 overflow-hidden aspect-square flex flex-col relative ${expired
                ? 'border-red-200/50 cursor-default opacity-80'
                : 'border-[#0f4c3a]/5 hover:shadow-lg hover:border-[#0f4c3a]/10 cursor-pointer'
                }`}
        >
            {/* IMAGE */}
            <div className="w-full h-[40%] overflow-hidden relative shrink-0">
                <img src={coverImage} alt={property.title} className={`w-full h-full object-cover transition-transform duration-500 ${expired ? 'grayscale' : 'group-hover:scale-105'}`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                <div className="absolute top-2.5 left-2.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border backdrop-blur-sm ${expired ? 'bg-red-100/80 text-red-600 border-red-200' : getStatusColor(app.status)
                        }`}>
                        {expired ? <XCircle size={10} /> : (app.status === 'Success' || app.status === 'Paid' ? <CheckCircle size={10} /> : <Clock size={10} />)}
                        {expired ? 'Cancelled' : (app.status || 'Pending')}
                    </span>
                </div>
                {/* HOVER OVERLAY - only show if not expired */}
                {!expired && (
                    <div className="absolute inset-0 bg-[#0f4c3a]/60 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="flex items-center gap-2 text-white text-xs font-bold uppercase tracking-widest">
                            Resume your application <ArrowRight size={14} />
                        </span>
                    </div>
                )}
            </div>

            {/* CONTENT */}
            <div className="flex-1 flex flex-col justify-between p-4">
                <div>
                    <h4 className={`font-serif text-lg line-clamp-2 leading-snug transition-colors mb-1 ${expired ? 'text-[#9ca3af]' : 'text-[#111827] group-hover:text-green-800'
                        }`}>
                        {property.name || "Untitled Property"}
                    </h4>
                    <p className="flex items-center gap-1 text-sm text-[#6b7280]">
                        <MapPin size={14} />
                        {property.city || "Germany"}
                    </p>
                </div>

                {/* DATES */}
                <div className="flex gap-3 mt-3 bg-[#f0f0f0] rounded-xl p-3">
                    <div className="flex-1">
                        <span className="block text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] mb-0.5">Move In</span>
                        <span className="text-sm font-semibold text-[#111827]">{formatDate(app.move_in_date)}</span>
                    </div>
                    <div className="w-px bg-[#0f4c3a]/10"></div>
                    <div className="flex-1">
                        <span className="block text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] mb-0.5">Move Out</span>
                        <span className="text-sm font-semibold text-[#111827]">{formatDate(app.move_out_date)}</span>
                    </div>
                </div>

                {/* PRICE + TIMER */}
                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#0f4c3a]/5">
                    <div>
                        <span className="text-xl font-serif font-bold text-[#111827]">€{monthlyPrice.toLocaleString()}</span>
                        <span className="text-xs text-[#9ca3af] ml-1">/month</span>
                    </div>
                    <CountdownTimer createdAt={app.created_at} onExpire={() => setExpired(true)} />
                </div>
            </div>

            {/* EXPIRED OVERLAY */}
            {expired && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center z-10">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-3">
                        <XCircle size={24} className="text-red-500" />
                    </div>
                    <h4 className="font-serif text-base font-bold text-[#111827] mb-1">Application Cancelled</h4>
                    <p className="text-xs text-[#6b7280] leading-relaxed">
                        Sorry, the 48-hour deadline has passed. Your refund will be initiated within 1–2 business days.
                    </p>
                </div>
            )}
        </motion.div>
    );
};

export default MyApplications;


