import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Mail, Phone, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

// --- SERVICES ---
import {
    signInWithOtp,
    verifyOtp,
    signInWithOAuth
} from '../../supabase/services/auth.service';
import { supabase } from '../../supabase/client';

// --- GOOGLE ICON ---
const GoogleIcon = () => (
    <svg
        viewBox="0 0 24 24"
        className="w-5 h-5"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

const AuthModal = () => {
    const { isAuthModalOpen, closeAuthModal, user, pendingBookingStateRef } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // LOCAL STATE
    const [step, setStep] = useState(1);
    const [authMethod, setAuthMethod] = useState('email'); // 'email' | 'phone'
    const [inputValue, setInputValue] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [inputType, setInputType] = useState('email'); // Default to email

    // RESEND OTP STATE
    const [resendTimer, setResendTimer] = useState(30);
    const [canResend, setCanResend] = useState(false);

    // REMEMBER ME STATE
    const [rememberMe, setRememberMe] = useState(() => {
        return localStorage.getItem('arrivio_remember_me') === 'true';
    });

    // RESET STATE ON OPEN
    useEffect(() => {
        if (isAuthModalOpen) {
            setStep(1);
            setAuthMethod('email');
            setInputType('email');
            setInputValue('');
            setOtp('');
            setLoading(false);
            setResendTimer(30);
            setCanResend(false);
        }
    }, [isAuthModalOpen]);

    // RESEND TIMER
    useEffect(() => {
        if (!isAuthModalOpen || step !== 2 || canResend) return;

        const interval = setInterval(() => {
            setResendTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setCanResend(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isAuthModalOpen, step, canResend]);

    // TOGGLE METHOD
    const toggleAuthMethod = () => {
        const newMethod = authMethod === 'phone' ? 'email' : 'phone';
        setAuthMethod(newMethod);
        setInputValue('');
        setInputType(newMethod);
    };

    // INPUT HANDLING
    const handleInputChange = (val) => {
        setInputValue(val);
        // Backend type is already set by toggleAuthMethod, but specific regex checks could happen here if needed
    };

    // REMEMBER ME HANDLING
    const handleRememberMeChange = (checked) => {
        setRememberMe(checked);
        localStorage.setItem('arrivio_remember_me', checked.toString());
    };

    // 1. SEND OTP
    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!inputValue) return;

        setLoading(true);
        try {
            // Persist preference before sending OTP
            localStorage.setItem('arrivio_remember_me', rememberMe.toString());
            await signInWithOtp(inputValue);
            setResendTimer(30);
            setCanResend(false);
            setStep(2);
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    // 2. VERIFY OTP
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (otp.length < 6) return;

        setLoading(true);
        try {
            const { user } = await verifyOtp(inputValue, otp, 'email');
            if (user) {
                // SUCCESS: Close modal, stay on page
                closeAuthModal();
            }
        } catch (error) {
            alert('Invalid or expired code');
        } finally {
            setLoading(false);
        }
    };

    // 3. GOOGLE LOGIN
    const handleGoogleLogin = async () => {
        setLoading(true);

        // Save booking state for recovery after redirect
        sessionStorage.setItem('auth_return_path', location.pathname);
        localStorage.setItem('arrivio_remember_me', rememberMe.toString());
        if (pendingBookingStateRef?.current) {
            sessionStorage.setItem('booking_redirect_state', JSON.stringify(pendingBookingStateRef.current));
        }

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin + '/auth/callback',
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'select_account',
                    },
                },
            });

            if (error) throw error;
        } catch (error) {
            console.error('Google Login Error:', error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    // If user is already logged in, show different content? 
    // Ideally modal shouldn't be open if logged in, but let's handle safety.
    useEffect(() => {
        if (user && isAuthModalOpen) {
            closeAuthModal();
        }
    }, [user, isAuthModalOpen, closeAuthModal]);

    return (
        <AnimatePresence>
            {isAuthModalOpen && (
                <>
                    {/* BACKDROP - Neutral blur, no color tint */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeAuthModal}
                        className="fixed inset-0 bg-black/20 backdrop-blur-md z-[200]"
                    />

                    {/* MODAL WRAPPER - Flexbox Centering */}
                    <div className="fixed inset-0 z-[201] flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="w-full max-w-[420px] bg-white rounded-2xl shadow-xl pointer-events-auto flex flex-col overflow-hidden"
                        >
                            {/* HEADER */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                                <h2 className="text-[22px] font-semibold text-[#111827] font-serif">
                                    Login to Arrivio
                                </h2>
                                <button
                                    onClick={closeAuthModal}
                                    className="p-1 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6">
                                {step === 1 && (
                                    <>

                                        {/* STEP 1: INPUT & SOCIALS */}
                                        <form onSubmit={handleSendOtp} className="space-y-4">
                                            <div className="relative">
                                                {authMethod === 'phone' ? (
                                                    <div className="flex gap-3">
                                                        <div className="w-[70px] flex items-center justify-center border border-gray-300 rounded-lg bg-gray-50 text-gray-600 font-medium select-none">
                                                            +91
                                                        </div>
                                                        <input
                                                            value={inputValue}
                                                            onChange={(e) => {
                                                                const val = e.target.value.replace(/[^0-9]/g, '');
                                                                handleInputChange(val);
                                                            }}
                                                            placeholder="Mobile Number"
                                                            type="tel"
                                                            maxLength="10"
                                                            className="flex-1 border border-gray-300 rounded-lg px-4 py-3.5 text-gray-800 placeholder:text-gray-400 focus:border-[#0f4c3a] focus:ring-1 focus:ring-[#0f4c3a] outline-none transition-all"
                                                            required
                                                            autoFocus
                                                        />
                                                    </div>
                                                ) : (
                                                    <input
                                                        value={inputValue}
                                                        onChange={(e) => handleInputChange(e.target.value)}
                                                        placeholder="Email address"
                                                        type="email"
                                                        className="w-full border border-gray-300 rounded-lg px-4 py-3.5 text-gray-800 placeholder:text-gray-400 focus:border-[#0f4c3a] focus:ring-1 focus:ring-[#0f4c3a] outline-none transition-all"
                                                        required
                                                        autoFocus
                                                    />
                                                )}
                                            </div>

                                            {/* BUTTON - Arrivio Green */}
                                            <button
                                                disabled={loading}
                                                className="w-full py-3.5 bg-[#0f4c3a] hover:bg-[#1A2E22] text-[#f2f2f2] rounded-lg text-sm font-bold transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                                            >
                                                {loading ? 'Sending...' : 'Continue'}
                                            </button>
                                        </form>

                                        {/* DIVIDER */}
                                        <div className="relative flex py-6 items-center">
                                            <div className="flex-grow border-t border-gray-200"></div>
                                            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase tracking-wide">
                                                or log in using
                                            </span>
                                            <div className="flex-grow border-t border-gray-200"></div>
                                        </div>

                                        {/* SOCIAL BUTTONS */}
                                        <div className="space-y-3">
                                            {/* EMAIL/PHONE TOGGLE */}
                                            <button
                                                onClick={toggleAuthMethod}
                                                className="w-full border border-gray-200 rounded-lg py-3 flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors group"
                                            >
                                                {authMethod === 'phone' ? (
                                                    <>
                                                        <Mail size={18} className="text-gray-600 group-hover:text-[#111827]" />
                                                        <span className="text-sm font-medium text-gray-700">Continue with Email</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Phone size={18} className="text-gray-600 group-hover:text-[#111827]" />
                                                        <span className="text-sm font-medium text-gray-700">Continue with Mobile</span>
                                                    </>
                                                )}
                                            </button>

                                            {/* GOOGLE */}
                                            <button
                                                onClick={handleGoogleLogin}
                                                disabled={loading}
                                                className="w-full border border-gray-200 rounded-lg py-3 flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors"
                                            >
                                                <GoogleIcon />
                                                <span className="text-sm font-medium text-gray-700">Continue with Google</span>
                                            </button>
                                        </div>

                                        {/* REMEMBER ME & TERMS */}
                                        <div className="mt-6 space-y-3">
                                            <div className="flex items-center gap-3">
                                                <input
                                                    id="remember-me"
                                                    type="checkbox"
                                                    checked={rememberMe}
                                                    onChange={(e) => handleRememberMeChange(e.target.checked)}
                                                    className="accent-[#0f4c3a] w-4 h-4 rounded cursor-pointer"
                                                />
                                                <label htmlFor="remember-me" className="text-sm text-gray-700 cursor-pointer select-none">
                                                    Keep me signed in
                                                </label>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className="pt-0.5">
                                                    <input type="checkbox" defaultChecked className="accent-[#0f4c3a] w-4 h-4 rounded cursor-pointer" />
                                                </div>
                                                <p className="text-xs text-gray-500 leading-relaxed">
                                                    By signing in you agree to our{' '}
                                                    <button className="text-[#111827] hover:underline font-medium">Privacy Policy</button>
                                                    {' '}and{' '}
                                                    <button className="text-[#111827] hover:underline font-medium">Terms & Conditions</button>
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {step === 2 && (
                                    <form onSubmit={handleVerifyOtp} className="space-y-6">
                                        <div className="text-center">
                                            <h3 className="text-lg font-bold text-[#111827] mb-1">Verify your number</h3>
                                            <p className="text-sm text-gray-500">
                                                Enter the code sent to <span className="font-semibold text-gray-800">{inputValue}</span>
                                            </p>
                                        </div>

                                        <input
                                            maxLength="6"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                                            placeholder="000000"
                                            className="w-full py-4 rounded-xl bg-gray-50 border border-gray-200 text-center tracking-[0.5em] text-xl font-bold text-[#111827] focus:ring-2 focus:ring-[#0f4c3a]/20 focus:border-[#0f4c3a] outline-none transition-all"
                                            autoFocus
                                        />

                                        <button
                                            disabled={loading}
                                            className="w-full py-3.5 bg-[#0f4c3a] hover:bg-[#1A2E22] text-[#f2f2f2] rounded-lg text-sm font-bold transition-colors shadow-sm disabled:opacity-70"
                                        >
                                            {loading ? 'Verifying...' : 'Confirm & Continue'}
                                        </button>

                                        <div className="flex items-center justify-between text-xs font-medium pt-2">
                                            <button
                                                type="button"
                                                onClick={() => setStep(1)}
                                                className="text-gray-500 hover:text-[#111827]"
                                            >
                                                Change Details
                                            </button>

                                            {canResend ? (
                                                <button
                                                    type="button"
                                                    onClick={handleSendOtp}
                                                    className="text-[#111827] hover:underline"
                                                >
                                                    Resend OTP
                                                </button>
                                            ) : (
                                                <span className="text-gray-400">Resend in {resendTimer}s</span>
                                            )}
                                        </div>
                                    </form>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default AuthModal;


