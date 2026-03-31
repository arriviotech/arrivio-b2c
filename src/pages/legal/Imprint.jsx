import React from 'react';

const Imprint = () => {
  return (
    <div className="min-h-screen bg-[#f2f2f2] pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-serif text-4xl md:text-5xl text-[#1A1A1A] mb-12">
          Imprint.
        </h1>

        <div className="font-sans text-[#5C5C50] space-y-8 leading-relaxed">
          <div>
            <h3 className="font-serif text-xl text-[#1A1A1A] mb-2">Company Information</h3>
            <p>
              Arrivio Living GmbH<br />
              Torstraße 1<br />
              10119 Berlin<br />
              Germany
            </p>
          </div>

          <div>
            <h3 className="font-serif text-xl text-[#1A1A1A] mb-2">Contact</h3>
            <p>
              Email: hello@arrivio.com<br />
              Phone: +49 (0) 30 1234 5678
            </p>
          </div>

          <div>
            <h3 className="font-serif text-xl text-[#1A1A1A] mb-2">Represented by</h3>
            <p>
              Managing Directors: Jane Doe, John Smith
            </p>
          </div>

          <div>
            <h3 className="font-serif text-xl text-[#1A1A1A] mb-2">Register Entry</h3>
            <p>
              Entry in the Commercial Register.<br />
              Register Court: District Court Berlin (Charlottenburg)<br />
              Register Number: HRB 123456
            </p>
          </div>

          <div>
            <h3 className="font-serif text-xl text-[#1A1A1A] mb-2">VAT ID</h3>
            <p>
              Sales tax identification number according to § 27 a Sales Tax Law:<br />
              DE 123 456 789
            </p>
          </div>

          <div className="pt-8 opacity-80 text-sm">
            <p>The European Commission provides a platform for online dispute resolution (OS): https://ec.europa.eu/consumers/odr.</p>
            <p>We are not willing or obliged to participate in dispute resolution proceedings before a consumer arbitration board.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Imprint;


