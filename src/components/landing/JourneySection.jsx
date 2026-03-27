import React from 'react';
import { motion } from 'framer-motion';
import { Search, FileCheck, Home, Heart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

// --- YOUR IMAGE IMPORTS ---
import journeyImg1 from '../../assets/journeyImg1.webp';
import journeyImg2 from '../../assets/journeyImg2.webp';

const JourneySection = () => {
   const steps = [
      {
         number: '01',
         icon: Search,
         title: 'Explore',
         description: "Browse our curated collection of community spaces designed for life wherever you choose to land.",
      },
      {
         number: '02',
         icon: FileCheck,
         title: 'Apply',
         description: 'Complete a simple 10-minute application. No credit checks, no complicated paperwork.',
      },
      {
         number: '03',
         icon: Home,
         title: 'Move In',
         description: 'Receive your keys and step into your fully furnished, ready-to-live space.',
      },
      {
         number: '04',
         icon: Heart,
         title: 'Thrive',
         description: 'Join community events, build connections, and start your new chapter with ease.',
      },
   ];

   return (
      <section id="community" className="bg-[#f2f2f2] py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">

         <div className="max-w-7xl mx-auto">

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

               {/* --- LEFT COLUMN --- */}
               <div className="relative z-10">

                  {/* Header */}
                  <motion.div
                     initial={{ opacity: 0, y: 20 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     viewport={{ once: true }}
                     // Mobile: Centered text. Desktop: Left aligned text.
                     className="mb-12 text-center lg:text-left"
                  >
                     {/* Responsive Label */}
                     <div className="flex items-center justify-center lg:justify-start gap-3 mb-6 ">
                        {/* Left Line (Always visible) */}
                        <div className="w-8 h-[1px] bg-[#0f4c3a]"></div>

                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#111827] font-sans">
                           The Process
                        </span>

                        {/* Right Line (Visible on Mobile, Hidden on Desktop 'lg:hidden') */}
                        <div className="w-8 h-[1px] bg-[#0f4c3a] lg:hidden"></div>
                     </div>

                     <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#1A1A1A] leading-tight">
                        Your journey to <br />
                        <span className="italic text-[#111827]">belonging.</span>
                     </h2>
                  </motion.div>

                  {/* Steps Container with Timeline */}
                  <div className="relative">

                     {/* Connecting Timeline Line */}
                     <div className="absolute left-[33px] top-[40px] bottom-[40px] w-[2px] bg-gradient-to-b from-[#0f4c3a]/20 via-[#0f4c3a]/10 to-transparent z-0"></div>

                     {steps.map((step, index) => {
                        const IconComponent = step.icon;
                        return (
                           <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: index * 0.1, duration: 0.5 }}
                              className="group relative flex gap-6 p-6 rounded-2xl transition-all duration-500 hover:bg-white/30 text-left"
                           >
                              {/* Number/Icon */}
                              <div className="flex-shrink-0 relative z-10">
                                 <div className="w-14 h-14 rounded-full bg-white border-2 border-[#0f4c3a]/15 flex items-center justify-center text-[#111827] group-hover:bg-[#0f4c3a] group-hover:text-white group-hover:border-[#0f4c3a] transition-all duration-500 shadow-sm">
                                    <span className="font-mono font-bold text-sm absolute -top-1 -right-1 bg-[#D4A017] text-white w-5 h-5 flex items-center justify-center rounded-full text-[10px]">
                                       {step.number}
                                    </span>
                                    <IconComponent size={22} strokeWidth={1.5} />
                                 </div>
                              </div>

                              {/* Text */}
                              <div className="flex-1 pt-1">
                                 <h3 className="font-serif text-2xl text-[#1A1A1A] mb-2 group-hover:text-[#111827] transition-colors">
                                    {step.title}
                                 </h3>
                                 <p className="font-sans text-sm text-[#5C5C50] leading-relaxed group-hover:text-[#1A1A1A]/80 transition-colors">
                                    {step.description}
                                 </p>
                              </div>
                           </motion.div>
                        );
                     })}
                  </div>

                  {/* Button */}
                  <motion.div
                     initial={{ opacity: 0 }}
                     whileInView={{ opacity: 1 }}
                     viewport={{ once: true }}
                     transition={{ delay: 0.4 }}
                     // Mobile: Centered button. Desktop: Left aligned button.
                     className="mt-12 flex justify-center lg:justify-start lg:pl-6"
                  >
                     <Link to="/search">
                        <button className="h-14 px-8 bg-[#0f4c3a] text-[#f2f2f2] rounded-full font-sans font-bold text-xs uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-[#1A1A1A] hover:scale-105 transition-all shadow-xl">
                           Start Exploring
                           <ArrowRight size={16} />
                        </button>
                     </Link>
                  </motion.div>

               </div>


               {/* --- RIGHT COLUMN --- */}
               <div className="relative h-[600px] hidden lg:block">
                  <motion.div
                     initial={{ opacity: 0, y: 50 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     viewport={{ once: true }}
                     transition={{ duration: 0.8 }}
                     className="absolute top-0 right-0 w-[80%] h-[60%] rounded-[2rem] overflow-hidden shadow-xl border-4 border-[#f0f0f0] z-10"
                  >
                     <img src={journeyImg2} alt="Interior space" className="w-full h-full object-cover grayscale-[10%]" />
                     <div className="absolute inset-0 bg-[#0f4c3a] mix-blend-multiply opacity-20"></div>
                     <div className="absolute top-6 right-6 bg-[#f0f0f0]/90 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#111827]">Move-in Ready</span>
                     </div>
                  </motion.div>

                  <motion.div
                     initial={{ opacity: 0, y: 50 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     viewport={{ once: true }}
                     transition={{ duration: 0.8, delay: 0.2 }}
                     className="absolute bottom-0 left-0 w-[80%] h-[60%] rounded-[2rem] overflow-hidden shadow-2xl border-4 border-[#f0f0f0] z-20"
                  >
                     <img src={journeyImg1} alt="Interior space" className="w-full h-full object-cover" />
                     <div className="absolute inset-0 bg-[#0f4c3a] mix-blend-multiply opacity-10"></div>

                  </motion.div>

                  <div className="absolute top-[40%] left-[10%] w-32 h-32 border border-[#0f4c3a]/10 rounded-full -z-0"></div>
                  <div className="absolute bottom-[10%] right-[10%] w-20 h-20 bg-[#D4A017]/20 rounded-full blur-2xl -z-0"></div>
               </div>

            </div>
         </div>
      </section>
   );
};

export default JourneySection;

