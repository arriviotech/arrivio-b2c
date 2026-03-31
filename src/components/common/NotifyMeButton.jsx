import React, { useState } from "react";
import { Bell, Check, Loader2 } from "lucide-react";
import { supabase } from "../../supabase/client";
import { useAuth } from "../../context/AuthContext";

const NotifyMeButton = ({ propertyId, unitId, city, propertyName }) => {
  const { user } = useAuth();
  const [state, setState] = useState("idle"); // idle | loading | success | error
  const [email, setEmail] = useState("");
  const [showInput, setShowInput] = useState(false);

  const handleNotify = async () => {
    const notifyEmail = user?.email || email;
    if (!notifyEmail) {
      setShowInput(true);
      return;
    }

    setState("loading");

    try {
      const { error } = await supabase.from("enquiries").insert({
        profile_id: user?.id || null,
        name: user?.user_metadata?.full_name || "",
        email: notifyEmail,
        city: city || "",
        source: "website_form",
        message: `Waitlist request for ${propertyName || "property"}${unitId ? ` (unit ${unitId})` : ""}`,
        status: "new",
      });

      if (error) throw error;
      setState("success");
    } catch (err) {
      console.error("Notify me error:", err);
      setState("error");
      setTimeout(() => setState("idle"), 3000);
    }
  };

  if (state === "success") {
    return (
      <div className="w-full py-4 bg-[#22C55E]/10 border border-[#22C55E]/20 rounded-xl flex items-center justify-center gap-2 text-sm font-medium text-[#22C55E]">
        <Check size={18} strokeWidth={2.5} />
        We'll notify you when available!
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {showInput && !user && (
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full px-4 py-3 bg-[#f0f0f0] border border-[#0f4c3a]/10 rounded-xl text-sm font-medium text-[#111827] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#0f4c3a]/10"
          onKeyDown={(e) => e.key === "Enter" && handleNotify()}
        />
      )}
      <button
        onClick={handleNotify}
        disabled={state === "loading" || (showInput && !email)}
        className="w-full py-3.5 bg-[#0f4c3a] text-[#f2f2f2] rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#0a3a2b] transition-colors disabled:opacity-50"
      >
        {state === "loading" ? (
          <><Loader2 size={14} className="animate-spin" /> Saving...</>
        ) : state === "error" ? (
          "Something went wrong. Try again."
        ) : (
          <><Bell size={14} /> Notify me when available</>
        )}
      </button>
      <p className="text-[10px] text-[#9ca3af] text-center">
        We'll email you as soon as a unit opens up
      </p>
    </div>
  );
};

export default NotifyMeButton;
