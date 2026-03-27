import React from 'react';

const Contact = () => {
  return (
    <div className="min-h-screen bg-[#f2f2f2] pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-serif text-5xl md:text-7xl text-[#1A1A1A] mb-8">
          Contact.
        </h1>
        <p className="font-sans text-xl text-[#5C5C50] max-w-2xl mb-16 leading-relaxed">
          We are here to assist with your inquiries. Whether you are looking for corporate housing solutions or partnership opportunities, reach out to our dedicated team.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h3 className="font-serif text-2xl text-[#1A1A1A] mb-4">General Inquiries</h3>
            <p className="font-sans text-[#5C5C50] mb-2">hello@arrivio.com</p>
            <p className="font-sans text-[#5C5C50]">+49 178 8354826</p>
          </div>
          <div>
            <h3 className="font-serif text-2xl text-[#1A1A1A] mb-4">Corporate Partnerships</h3>
            <p className="font-sans text-[#5C5C50] mb-2">business@arrivio.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;


