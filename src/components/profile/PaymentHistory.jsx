import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Calendar, MapPin, Receipt, Loader } from 'lucide-react';
import { supabase } from '../../supabase/client';
import { useAuth } from '../../context/AuthContext';

const PaymentHistory = () => {
    const { user } = useAuth();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchPayments = async () => {
            const { data, error } = await supabase
                .from('payments')
                .select(`
                    id,
                    payment_type,
                    amount_cents,
                    status,
                    currency,
                    description,
                    paid_at,
                    created_at
                `)
                .eq('payer_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching payments:', error);
            } else {
                setPayments(data || []);
            }
            setLoading(false);
        };

        fetchPayments();
    }, [user]);

    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'succeeded':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'refunded':
            case 'partially_refunded':
                return 'bg-red-50 text-red-600 border-red-100';
            case 'failed':
                return 'bg-red-50 text-red-600 border-red-100';
            case 'disputed':
                return 'bg-amber-50 text-amber-600 border-amber-200';
            default:
                return 'bg-yellow-50 text-yellow-700 border-yellow-100';
        }
    };

    const formatPaymentType = (type) => {
        const labels = {
            holding_deposit: 'Holding Deposit',
            security_deposit: 'Security Deposit',
            monthly_rent: 'Monthly Rent',
            addon: 'Add-on Service',
            event_ticket: 'Event Ticket',
            deposit_refund: 'Deposit Refund',
            holding_deposit_refund: 'Holding Deposit Refund',
        };
        return labels[type] || type;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader className="animate-spin text-[#111827]/30" size={24} />
            </div>
        );
    }

    if (payments.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="w-14 h-14 rounded-full bg-[#0f4c3a]/5 flex items-center justify-center mx-auto mb-4">
                    <Receipt size={24} className="text-[#111827]/30" />
                </div>
                <p className="text-sm text-[#9ca3af]">No payments yet</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {payments.map((payment, index) => {
                const amount = Math.round((payment.amount_cents || 0) / 100);
                const date = new Date(payment.paid_at || payment.created_at);

                return (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        key={payment.id}
                        className="bg-white rounded-2xl border border-[#0f4c3a]/5 shadow-sm p-4 hover:shadow-md transition-shadow"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            {/* ICON + INFO */}
                            <div className="flex items-center gap-4 flex-1">
                                <div className="w-12 h-12 rounded-xl bg-[#0f4c3a]/5 flex items-center justify-center shrink-0">
                                    <CreditCard size={20} className="text-[#4b5563]" />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-serif text-base text-[#111827] truncate mb-0.5">
                                        {formatPaymentType(payment.payment_type)}
                                    </h4>
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#9ca3af]">
                                        <span className="flex items-center gap-1">
                                            <Calendar size={10} />
                                            {date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </span>
                                        {payment.description && (
                                            <span>{payment.description}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* AMOUNT + STATUS */}
                            <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-[#0f4c3a]/5 pt-3 sm:pt-0 mt-2 sm:mt-0 w-full sm:w-auto">
                                <p className="font-serif text-lg font-bold text-[#111827]">
                                    €{amount.toLocaleString()}
                                </p>
                                <span className={`inline-block sm:mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${getStatusStyle(payment.status)}`}>
                                    {payment.status || 'pending'}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div >
    );
};

export default PaymentHistory;
