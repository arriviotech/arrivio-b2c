import React from 'react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-[#f2f2f2] pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-serif text-4xl md:text-5xl text-[#1A1A1A] mb-12">
          Terms of Service.
        </h1>

        <div className="font-sans text-[#5C5C50] space-y-8 leading-relaxed">
          <p>
            Welcome to Arrivio. By accessing our website and using our services, you agree to comply with and be bound by the following terms and conditions.
          </p>

          <h3 className="font-serif text-xl text-[#1A1A1A] pt-4">1. Services</h3>
          <p>
            Arrivio provides corporate housing and relocation services. We act as an intermediary between property owners and tenants, ensuring a seamless booking experience.
          </p>

          <h3 className="font-serif text-xl text-[#1A1A1A] pt-4">2. Bookings & Payments</h3>
          <p>
            All bookings are subject to availability and confirmation. Payments must be made in accordance with the terms specified in your booking agreement. Arrivio reserves the right to cancel bookings in case of non-payment or breach of terms.
          </p>

          <h3 className="font-serif text-xl text-[#1A1A1A] pt-4">3. Liability</h3>
          <p>
            While we strive for excellence, Arrivio is not liable for any indirect, incidental, or consequential damages arising from the use of our services, except in cases of gross negligence or willful misconduct.
          </p>

          <h3 className="font-serif text-xl text-[#1A1A1A] pt-4">4. Governing Law</h3>
          <p>
            These terms are governed by the laws of the Federal Republic of Germany. The place of jurisdiction is Berlin.
          </p>

          <p className="text-sm pt-8 opacity-60">
            Last Updated: February 2026
          </p>
        </div>
      </div>
    </div>
  );
};

export default Terms;


