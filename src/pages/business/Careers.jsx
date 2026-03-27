import React from 'react';

const Careers = () => {
  return (
    <div className="min-h-screen bg-[#f2f2f2] pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-serif text-5xl md:text-7xl text-[#1A1A1A] mb-8">
          Careers.
        </h1>
        <p className="font-sans text-xl text-[#5C5C50] max-w-2xl mb-16 leading-relaxed">
          Join us in redefining the future of global living. We are always looking for visionary talent to help us build the most seamless relocation experience in the world.
        </p>

        <div className="space-y-12">
          <div className="border-t border-[#1A1A1A]/10 pt-8">
            <h3 className="font-serif text-2xl text-[#1A1A1A] mb-2">No Open Positions</h3>
            <p className="font-sans text-[#5C5C50]">
              We currently do not have any specific openings, but we are always interested in meeting exceptional people. Send your portfolio or CV to <span className="text-[#111827] font-medium">careers@arrivio.com</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Careers;


