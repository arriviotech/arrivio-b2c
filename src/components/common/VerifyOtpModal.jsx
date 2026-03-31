import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Mail, Phone } from "lucide-react";

const VerifyOtpModal = ({ type = "email", value, onVerified, onClose }) => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
  const [resendTimer, setResendTimer] = useState(0);
  const inputRefs = useRef([]);

  // Auto-send OTP on mount
  useEffect(() => {
    handleSendCode();
  }, []);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  const handleSendCode = async () => {
    setSending(true);
    setError(null);
    try {
      // For now — demo mode: simulate sending
      await new Promise(r => setTimeout(r, 1000));
      setSent(true);
      setResendTimer(30);
    } catch (err) {
      setError("Failed to send code. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleCodeChange = (index, val) => {
    if (val.length > 1) val = val.slice(-1);
    if (val && !/^\d$/.test(val)) return;

    const newCode = [...code];
    newCode[index] = val;
    setCode(newCode);

    // Auto-focus next
    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setCode(pasted.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      setError("Please enter the full 6-digit code");
      return;
    }

    setVerifying(true);
    setError(null);
    try {
      // Demo mode: accept any 6-digit code
      await new Promise(r => setTimeout(r, 800));
      onVerified();
    } catch (err) {
      setError("Invalid code. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const Icon = type === "phone" ? Phone : Mail;
  const label = type === "phone" ? "phone number" : "email";
  const maskedValue = type === "phone"
    ? value?.replace(/(.{3})(.*)(.{2})/, "$1***$3")
    : value?.replace(/(.{2})(.*)(@.*)/, "$1***$3");

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-[#0f4c3a]/5 flex items-center justify-center">
                <Icon size={16} className="text-[#0f4c3a]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#111827]">Verify your {label}</h3>
                <p className="text-[10px] text-[#6b7280]">{maskedValue}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-full bg-[#f2f2f2] hover:bg-[#e5e5e5] flex items-center justify-center">
              <X size={14} className="text-[#6b7280]" />
            </button>
          </div>

          {/* Sending state */}
          {sending && (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={20} className="animate-spin text-[#0f4c3a]" />
              <span className="text-sm text-[#6b7280] ml-2">Sending code...</span>
            </div>
          )}

          {/* Code input */}
          {sent && !sending && (
            <>
              <p className="text-[11px] text-[#6b7280] text-center mb-4">
                We sent a 6-digit code to your {label}. Enter it below.
              </p>

              <div className="flex justify-center gap-2 mb-4" onPaste={handlePaste}>
                {code.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className={`w-10 h-12 text-center text-lg font-bold rounded-lg border transition-colors focus:outline-none ${
                      digit ? "border-[#0f4c3a] bg-[#0f4c3a]/[0.03]" : "border-[#e5e7eb] bg-[#f9f9f7]"
                    } focus:border-[#0f4c3a]`}
                  />
                ))}
              </div>

              {error && <p className="text-xs text-[#EA4335] text-center mb-3">{error}</p>}

              <button
                onClick={handleVerify}
                disabled={verifying || code.join("").length !== 6}
                className="w-full py-3 bg-[#0f4c3a] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#0a3a2b] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {verifying ? <><Loader2 size={14} className="animate-spin" /> Verifying...</> : "Verify"}
              </button>

              <div className="flex items-center justify-center mt-3">
                {resendTimer > 0 ? (
                  <p className="text-[10px] text-[#9ca3af]">Resend in {resendTimer}s</p>
                ) : (
                  <button onClick={handleSendCode} className="text-[10px] font-semibold text-[#0f4c3a] hover:underline">
                    Resend code
                  </button>
                )}
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VerifyOtpModal;
