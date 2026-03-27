import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Mail, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

// --- SERVICES ---
import { supabase } from '../../supabase/client';
import {
  signInWithOtp,
  verifyOtp,
  getUser,
  onAuthStateChange
} from '../../supabase/services/auth.service';

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

const SignIn = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  // AUTH
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // EXISTING FLOW STATE
  const [step, setStep] = useState(1);
  const [inputValue, setInputValue] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [inputType, setInputType] = useState('email');

  // RESEND OTP STATE
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // CHECK AUTH STATUS
  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await getUser();
        setUser(user);
      } catch (error) {
        // console.error("Auto-login check failed:", error);
      } finally {
        setCheckingAuth(false);
      }
    };
    checkUser();
  }, []);

  // ✅ 1. SAVE RETURN PATH ON MOUNT (Persist across refresh/OTP)
  useEffect(() => {
    if (state?.from) {
      sessionStorage.setItem('auth_return_path', state.from.pathname);
    }
    if (state?.title) {
      sessionStorage.setItem('booking_redirect_state', JSON.stringify(state));
    }
  }, [state]);

  // ✅ 2. AUTH STATE CHANGE → SMART REDIRECT
  useEffect(() => {
    const {
      data: { subscription },
    } = onAuthStateChange((session) => {
      if (session?.user) {
        const savedBookingState = sessionStorage.getItem('booking_redirect_state');
        const parsedBookingState = savedBookingState ? JSON.parse(savedBookingState) : null;

        // A. Booking Flow (Priority)
        if (state?.title || parsedBookingState) {
          const finalState = state?.title ? state : parsedBookingState;
          sessionStorage.removeItem('booking_redirect_state'); // Cleanup
          navigate('/booking/review', { state: finalState });
          return;
        }

        // B. Return to previous page
        const returnPath = state?.from?.pathname || sessionStorage.getItem('auth_return_path');

        if (returnPath) {
          sessionStorage.removeItem('auth_return_path'); // Cleanup
          navigate(returnPath, { replace: true });
        }
        // C. Default Home
        else {
          navigate('/', { replace: true });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, state]);

  // RESEND OTP TIMER
  useEffect(() => {
    if (step !== 2 || canResend) return;

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
  }, [step, canResend]);

  if (checkingAuth) return null;

  // INPUT TYPE DETECTION
  const handleInputChange = (val) => {
    setInputValue(val);
    const isPhone = /^[0-9+\s-]*$/.test(val) && val.length > 2;
    setInputType(isPhone ? 'phone' : 'email');
  };

  // EMAIL OTP SEND
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!inputValue) return;

    setLoading(true);

    try {
      await signInWithOtp(inputValue);
    } catch (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    // Logic moved to try/catch above

    setResendTimer(30);
    setCanResend(false);
    setStep(2);
  };

  // OTP VERIFY
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length < 6) return;

    setLoading(true);

    try {
      const { user } = await verifyOtp(inputValue, otp, 'email');

      if (user) {
        navigate('/booking/review', { state });
      }
    } catch (error) {
      alert('Invalid or expired code');
    } finally {
      setLoading(false);
    }

    // Logic moved to try/catch above
  };

  // GOOGLE AUTH
  const handleGoogleLogin = async () => {
    setLoading(true);

    // 💾 SAVE STATE BEFORE POPUP
    if (state?.from) {
      sessionStorage.setItem('auth_return_path', state.from.pathname);
    }
    if (state?.title) {
      sessionStorage.setItem('booking_redirect_state', JSON.stringify(state));
    }

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/auth/callback',
          skipBrowserRedirect: true,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      });

      if (error) throw error;

      if (data?.url) {
        console.log('Opening Popup URL:', data.url);
        const width = 500;
        const height = 600;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;
        window.open(
          data.url,
          'GoogleAuth',
          `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=${width}, height=${height}, top=${top}, left=${left}`
        );
      }
    } catch (error) {
      console.error("Google Login Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f2f2f2] flex">
      {/* LEFT COLUMN */}
      <div className="hidden lg:flex w-1/2 bg-[#0f4c3a] relative overflow-hidden items-center justify-center p-20 text-[#f2f2f2]">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="relative z-10 max-w-lg">
          <h1 className="font-serif text-5xl mb-6">Welcome to Arrivio.</h1>
          <p className="text-lg opacity-70 leading-relaxed">
            Join the exclusive community of global citizens. Rent verified homes
            with zero paperwork stress.
          </p>
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full mt-12"
        >
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-serif text-[#111827] mb-2">
              {user
                ? 'Welcome back'
                : step === 1
                  ? "Let's get started"
                  : "Verify it's you"}
            </h2>
            <p className="text-xs text-[#4b5563]">
              {user
                ? 'Confirm your details to continue.'
                : step === 1
                  ? 'Enter your details to create an account or sign in.'
                  : `We sent a 6-digit code to ${inputValue}`}
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#0f4c3a]/5">
            {user && (
              <div className="space-y-6">
                <div className="bg-[#f0f0f0] rounded-xl p-4">
                  <div className="text-xs text-[#4b5563]">{user.email}</div>
                </div>

                <button
                  onClick={() => navigate('/booking/review', { state })}
                  className="w-full py-4 bg-[#0f4c3a] text-[#f2f2f2] rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#1A1A1A] transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  Next <ArrowRight size={14} />
                </button>
              </div>
            )}

            {!user && (
              <>
                {step === 1 && (
                  <div className="space-y-6">
                    <form onSubmit={handleSendOtp} className="space-y-4">
                      <div className="relative">
                        {inputType === 'phone' ? (
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" size={16} />
                        ) : (
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" size={16} />
                        )}
                        <input
                          value={inputValue}
                          onChange={(e) => handleInputChange(e.target.value)}
                          placeholder="Email or Phone Number"
                          className="w-full pl-12 pr-4 py-4 rounded-xl bg-[#f0f0f0] text-sm font-bold"
                          required
                        />
                      </div>

                      <button disabled={loading} className="w-full py-4 bg-[#0f4c3a] text-[#f2f2f2] rounded-xl">
                        Continue
                      </button>
                    </form>

                    <button
                      onClick={handleGoogleLogin}
                      disabled={loading}
                      className="w-full py-4 bg-white border border-[#0f4c3a]/20 rounded-xl flex items-center justify-center gap-3 text-sm font-bold hover:bg-[#f0f0f0] transition-all"
                    >
                      <GoogleIcon />
                      Continue with Google
                    </button>
                  </div>
                )}

                {step === 2 && (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <input
                      maxLength="6"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="000000"
                      className="w-full py-4 rounded-xl bg-[#f0f0f0] text-center tracking-[0.5em]"
                    />

                    <button className="w-full py-4 bg-[#0f4c3a] text-[#f2f2f2] rounded-xl">
                      Confirm & Continue
                    </button>

                    <div className="text-center text-xs text-[#4b5563] space-y-1">
                      <div>
                        OTP sent to <span className="font-bold">{inputValue}</span>
                      </div>

                      {canResend ? (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          className="font-bold hover:underline"
                        >
                          Resend OTP
                        </button>
                      ) : (
                        <div>Resend OTP in {resendTimer}s</div>
                      )}
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignIn;


