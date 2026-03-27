import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, Linkedin, Twitter, ArrowUpRight, Globe, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo1 from '../../assets/logo1.png';

const Footer = () => {
   const currentYear = new Date().getFullYear();

   const footerLinks = {
      Company: [
         { name: 'Our Vision', path: '/#vision' },
         { name: 'Community', path: '/#community' },
         { name: 'Careers', path: '/careers' },
         { name: 'Contact', path: '/contact' },
         { name: 'For Businesses', path: 'https://arrivio-business.vercel.app/' },
      ],
      Locations: [
         { name: 'Aachen', path: '/cities' },
         { name: 'Berlin', path: '/cities' },
         { name: 'Bonn', path: '/cities' },
         { name: 'Cologne', path: '/cities' },
         { name: 'Düsseldorf', path: '/cities' },
         { name: 'Frankfurt', path: '/cities' },
         { name: 'Hamburg', path: '/cities' },
         { name: 'Munich', path: '/cities' },
      ],
      Legal: [
         { name: 'Privacy Policy', path: '/privacy' },
         { name: 'Terms of Service', path: '/terms' },
         { name: 'Imprint', path: '/imprint' },
      ],
   };

   return (
      // Background: Deep Forest Green (#1A2E22) for a bossy, grounded finish
      <footer className="relative bg-[#1A2E22] pt-24 pb-12 px-6 md:px-12 overflow-hidden text-[#f2f2f2]">

         {/* 1. THE BRAND WATERMARK (Subtle & Premium) */}
         <div className="absolute bottom-[-10%] right-[-5%] font-serif text-[15rem] md:text-[25rem] opacity-[0.03] select-none pointer-events-none leading-none">
            Arrivio
         </div>

         <div className="max-w-7xl mx-auto relative z-10">

            {/* --- TOP SECTION: BRAND & LINKS --- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24">

               {/* Left: Brand & Newsletter */}
               <div className="lg:col-span-5">
                  <div className="mb-8">
                     <div className="flex items-center gap-2 mb-4">
                        <img
                           src={logo1}
                           alt="Arrivio Logo"
                           className="h-10 w-auto object-contain"
                        />
                        <h2 className="font-serif text-5xl">Arrivio.</h2>
                     </div>
                     <p className="font-sans text-[#f2f2f2]/60 text-lg max-w-sm leading-relaxed">
                        Redefining belonging for the global citizen. Stability is the ultimate luxury.
                     </p>
                  </div>

                  {/* Newsletter Sign-up */}
                  <div className="max-w-md">
                     <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4 text-[#D4A017]">
                        Join our inner circle
                     </p>
                     <div className="relative group">
                        <input
                           type="email"
                           placeholder="Email address"
                           className="w-full bg-transparent border-b border-[#f2f2f2]/20 py-4 outline-none focus:border-[#D4A017] transition-colors font-serif italic text-xl"
                        />
                        <button className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-[#f2f2f2]/20 flex items-center justify-center hover:bg-[#f2f2f2] hover:text-[#1A2E22] transition-all">
                           <ArrowUpRight size={18} />
                        </button>
                     </div>
                  </div>
               </div>

               {/* Right: Sitemap Links */}
               <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-12">
                  {Object.entries(footerLinks).map(([title, links]) => (
                     <div key={title}>
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-8 text-[#D4A017]">
                           {title}
                        </h4>

                        <ul className="space-y-4">
                           {links.map((link) => {
                              const isExternal = link.path.startsWith('http');
                              const LinkComponent = isExternal ? 'a' : Link;
                              const linkProps = isExternal ? { href: link.path } : { to: link.path };

                              return (
                                 <li key={link.name}>
                                    <LinkComponent
                                       {...linkProps}
                                       state={link.state}
                                       className="text-sm font-sans text-[#f2f2f2]/60 hover:text-[#f2f2f2] transition-colors flex items-center gap-1 group"
                                    >
                                       {link.name}
                                       <ArrowUpRight
                                          size={12}
                                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                                       />
                                    </LinkComponent>
                                 </li>
                              );
                           })}
                        </ul>
                     </div>
                  ))}
               </div>
            </div>


            {/* --- BOTTOM SECTION: LEGAL & SOCIAL --- */}
            <div className="pt-12 border-t border-[#f2f2f2]/10 flex flex-col md:flex-row justify-between items-center gap-8">

               {/* Copyright */}
               <div className="flex flex-col md:flex-row items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-[#f2f2f2]/40">
                  <span>© {currentYear} Arrivio Living</span>
                  <div className="hidden md:block w-1 h-1 bg-[#D4A017] rounded-full"></div>
                  <div className="flex items-center gap-2">
                     <Globe size={12} />
                     <span>Headquarters: Berlin, Germany</span>
                  </div>
               </div>

               {/* Social Links */}
               <div className="flex items-center gap-6">
                  <a href="#" className="w-10 h-10 rounded-full border border-[#f2f2f2]/10 flex items-center justify-center hover:bg-[#f2f2f2]/5 transition-colors">
                     <Instagram size={18} />
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full border border-[#f2f2f2]/10 flex items-center justify-center hover:bg-[#f2f2f2]/5 transition-colors">
                     <Linkedin size={18} />
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full border border-[#f2f2f2]/10 flex items-center justify-center hover:bg-[#f2f2f2]/5 transition-colors">
                     <Twitter size={18} />
                  </a>
               </div>

            </div>

         </div>
      </footer>
   );
};

export default Footer;

