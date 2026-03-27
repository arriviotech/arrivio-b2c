import React, { useState } from 'react';

const tabs = ["Anyone", "Professionals", "Students", "Azubis"];

const SearchTabs = ({ activeTab, setActiveTab }) => {

    return (
        <div className="flex gap-8 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`
              pb-3 text-base sm:text-sm font-medium transition-colors relative whitespace-nowrap
              ${activeTab === tab
                            ? 'text-[#111827]'
                            : 'text-gray-500 hover:text-gray-800'
                        }
            `}
                >
                    {tab}
                    {activeTab === tab && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0f4c3a]" />
                    )}
                </button>
            ))}
        </div>
    );
};

export default SearchTabs;
