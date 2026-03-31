import React from 'react';

const PageLoader = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] w-full bg-[#f2f2f2]">
            <div className="relative w-16 h-16 mb-4">
                {/* Spinner Ring */}
                <div className="absolute inset-0 border-4 border-[#0f4c3a]/10 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-[#0f4c3a] border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-[#4b5563] font-medium text-sm animate-pulse">
                Loading Arrivio...
            </p>
        </div>
    );
};

export default PageLoader;


