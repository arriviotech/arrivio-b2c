import React from 'react';

const ProfileRow = ({ icon, label, value }) => (
    <div className="flex items-center gap-5 px-5 py-5 hover:bg-[#f7f7f7] rounded-2xl transition-colors group border border-transparent hover:border-[#0f4c3a]/5">
        <div className="w-10 h-10 rounded-full bg-[#f2f2f2] group-hover:bg-white flex items-center justify-center text-[#111827] shrink-0 custom-shadow transition-all group-hover:scale-110">
            {icon}
        </div>

        <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-[#9ca3af] font-bold mb-1">
                {label}
            </p>
            <p className="text-base font-medium text-[#111827] truncate">{value}</p>
        </div>
    </div>
);

export default ProfileRow;


