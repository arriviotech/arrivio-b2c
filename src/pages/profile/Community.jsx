import React from "react";
import { Users, Calendar, MessageCircle, Coffee, Music, Dumbbell } from "lucide-react";

const Community = () => {
  return (
    <div>
      <h2 className="text-xl font-serif text-[#111827] mb-6">Community</h2>

      <div className="bg-white rounded-2xl border border-[#e5e7eb] p-8 text-center mb-5">
        <div className="w-16 h-16 rounded-full bg-[#0f4c3a]/5 flex items-center justify-center mx-auto mb-4">
          <Users size={28} className="text-[#9ca3af]" />
        </div>
        <h3 className="font-serif text-lg text-[#111827] mb-2">Your Community Hub</h3>
        <p className="text-sm text-[#6b7280] mb-6 max-w-sm mx-auto">
          Once you move in, you'll get access to your property's community — events, clubs, shared spaces, and neighbours.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-lg mx-auto">
          <FeatureCard icon={Calendar} label="Events" desc="Property events" />
          <FeatureCard icon={MessageCircle} label="Feed" desc="Community posts" />
          <FeatureCard icon={Coffee} label="Spaces" desc="Book shared spaces" />
          <FeatureCard icon={Users} label="Neighbours" desc="Connect nearby" />
          <FeatureCard icon={Music} label="Clubs" desc="Interest groups" />
          <FeatureCard icon={Dumbbell} label="Wellness" desc="Fitness & yoga" />
        </div>
      </div>

      <div className="bg-[#0f4c3a] rounded-2xl p-6 text-center text-white">
        <p className="text-xs text-white/60 uppercase tracking-widest font-bold mb-2">Coming Soon</p>
        <p className="font-serif text-lg mb-1">Community launches with your move-in</p>
        <p className="text-xs text-white/50">Your community profile is auto-created when your booking is confirmed</p>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, label, desc }) => (
  <div className="bg-[#f7f7f7] rounded-xl p-4 text-center">
    <Icon size={20} className="text-[#0f4c3a] mx-auto mb-2" />
    <p className="text-xs font-bold text-[#111827]">{label}</p>
    <p className="text-[10px] text-[#9ca3af]">{desc}</p>
  </div>
);

export default Community;
