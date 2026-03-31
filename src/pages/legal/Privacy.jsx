
import React from 'react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-[#f2f2f2] pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-serif text-4xl md:text-5xl text-[#1A1A1A] mb-12">
          Privacy Policy.
        </h1>

        <div className="font-sans text-[#5C5C50] space-y-8 leading-relaxed">
          <p>
            At Arrivio, we value your discretion and are committed to protecting your personal data. This Privacy Policy outlines how we collect, use, and safeguard your information in accordance with the General Data Protection Regulation (GDPR).
          </p>

          <h3 className="font-serif text-xl text-[#1A1A1A] pt-4">1. Data Collection</h3>
          <p>
            We collect personal data that you voluntarily provide to us when you use our website, contact us, or book our services. This may include your name, email address, phone number, and payment information.
          </p>

          <h3 className="font-serif text-xl text-[#1A1A1A] pt-4">2. Use of Data</h3>
          <p>
            Your data is used solely for the purpose of providing our services, processing payments, and communicating with you regarding your bookings or inquiries. We do not sell or share your data with third parties for marketing purposes.
          </p>

          <h3 className="font-serif text-xl text-[#1A1A1A] pt-4">3. Data Security</h3>
          <p>
            We implement robust technical and organizational measures to ensure the security of your data against unauthorized access, loss, or alteration.
          </p>

          <h3 className="font-serif text-xl text-[#1A1A1A] pt-4">4. Your Rights</h3>
          <p>
            You have the right to access, correct, or delete your personal data at any time. To exercise these rights, please contact our Data Protection Officer at privacy@arrivio.com.
          </p>

          <p className="text-sm pt-8 opacity-60">
            Last Updated: February 2026
          </p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;


