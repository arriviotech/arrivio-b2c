import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const ProfilePageLayout = ({ title, children }) => {
  return (
    <div className="min-h-screen bg-[#f2f2f2]">
      <div className="max-w-3xl mx-auto px-4 md:px-8 pt-28 pb-20">
        {/* Back + Title */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/profile"
            className="p-2 rounded-full hover:bg-[#0f4c3a]/5 transition-colors text-[#4b5563] hover:text-[#111827]"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-serif text-[#111827]">{title}</h1>
        </div>

        {children}
      </div>
    </div>
  );
};

export default ProfilePageLayout;
