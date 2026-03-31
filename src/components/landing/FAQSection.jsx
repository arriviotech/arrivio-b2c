import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const FAQItem = ({ question, answer, isOpen, onClick }) => {
  return (
    <div className="border-b border-[#0f4c3a]/10 last:border-none">
      <button
        onClick={onClick}
        className="w-full py-6 flex items-center justify-between text-left focus:outline-none group"
      >
        <span className={`text-lg md:text-xl font-serif transition-colors duration-300 ${isOpen ? 'text-[#111827]' : 'text-[#1A1A1A] group-hover:text-[#111827]'}`}>
          {question}
        </span>

        {/* Animated Icon Container */}
        <span className={`ml-4 flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 ${isOpen ? 'bg-[#0f4c3a] text-[#f2f2f2]' : 'bg-[#f2f2f2] text-[#111827] group-hover:bg-[#0f4c3a]/10'}`}>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {isOpen ? <Minus size={16} /> : <Plus size={16} />}
          </motion.div>
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }} // Premium "Spring-like" ease
            className="overflow-hidden"
          >
            <p className="pb-8 pt-2 text-[#5C5C50] font-sans leading-relaxed max-w-3xl text-base md:text-lg">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQSection = () => {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState(-1);

  const faqs = [
    { question: t("faq.q1"), answer: t("faq.a1") },
    { question: t("faq.q2"), answer: t("faq.a2") },
    { question: t("faq.q3"), answer: t("faq.a3") },
    { question: t("faq.q4"), answer: t("faq.a4") },
    { question: t("faq.q5"), answer: t("faq.a5") },
  ];

  return (
    // Background: Warm Stone (#f2f2f2)
    <section id="faq" className="py-24 bg-[#f2f2f2] px-4 sm:px-6 lg:px-8">

      <div className="max-w-4xl mx-auto">

        {/* --- HEADER --- */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 mb-6 opacity-60"
          >
            <div className="w-8 h-[1px] bg-[#0f4c3a]"></div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#111827] font-sans">
              {t("faq.label")}
            </span>
            <div className="w-8 h-[1px] bg-[#0f4c3a]"></div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-serif text-4xl md:text-5xl lg:text-6xl text-[#1A1A1A] leading-tight mb-4"
          >
            {t("faq.title1")} <br />
            <span className="italic text-[#111827]">{t("faq.title2")}</span>
          </motion.h2>
        </div>

        {/* --- GLASS ACCORDION CONTAINER --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="bg-white/40 backdrop-blur-xl rounded-[2rem] shadow-lg shadow-black/5 border border-white/60 p-6 md:p-10"
        >
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
            />
          ))}
        </motion.div>

      </div>
    </section>
  );
};

export default FAQSection;

