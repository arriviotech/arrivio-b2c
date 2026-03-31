import React from "react";
import { Star, Box } from "lucide-react";
import { motion } from "framer-motion";

const ReviewsMetricsSection = ({ property }) => {
    return (
        <div id="reviews" className="pt-20 border-t border-[#0f4c3a]/10 scroll-mt-40">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <h3 className="font-serif text-2xl text-[#111827]">Experience</h3>
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
                            <Star size={12} className="fill-emerald-600 text-emerald-600" />
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">{property.rating || "4.8"} Rating</span>
                        </div>
                    </div>
                    <p className="text-base text-[#4b5563] font-medium">Verified feedback from the Arrivio community.</p>
                </div>

                <button className="flex items-center gap-3 px-6 py-3 bg-white border border-[#0f4c3a]/10 rounded-2xl text-xs font-bold uppercase tracking-widest text-[#111827] hover:bg-[#0f4c3a] hover:text-white transition-all shadow-sm group">
                    <Box size={16} className="group-hover:rotate-12 transition-transform" />
                    Take a Virtual Tour
                </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-16">
                {[
                    { label: "Cleanliness", score: "4.9" },
                    { label: "Accuracy", score: "4.8" },
                    { label: "Check-in", score: "5.0" },
                    { label: "Communication", score: "4.7" },
                    { label: "Location", score: "4.9" },
                    { label: "Value", score: "4.8" }
                ].map((metric, i) => (
                    <div key={metric.label} className="space-y-2">
                        <span className="text-xs font-bold uppercase tracking-widest text-[#9ca3af]">{metric.label}</span>
                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-1 bg-[#0f4c3a]/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    whileInView={{ width: `${(metric.score / 5) * 100}%` }}
                                    transition={{ duration: 1, delay: i * 0.1 }}
                                    className="h-full bg-[#0f4c3a]"
                                />
                            </div>
                            <span className="text-xs font-bold text-[#111827]">{metric.score}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Review Snippets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                    { name: "Julian W.", date: "February 2026", text: "Exceptional space for remote work. The high-speed fiber internet and ergonomic setup made my stay incredibly productive. The attention to detail in the design is even better in person." },
                    { name: "Sophie M.", date: "January 2026", text: "The Arrivio team was so helpful with my check-in. The location is perfect, quiet but close to everything. I'll definitely be booking this again for my next project in the city." }
                ].map((review, i) => (
                    <div key={i} className="p-8 bg-white/40 border border-[#0f4c3a]/5 rounded-[2rem] hover:bg-white hover:shadow-xl transition-all duration-500">
                        <div className="flex items-center gap-1 mb-4">
                            {[1, 2, 3, 4, 5].map(s => <Star key={s} size={12} className="fill-[#186b53] text-[#186b53]" />)}
                        </div>
                        <p className="text-[#1f2937] text-sm leading-relaxed mb-6 font-medium italic">"{review.text}"</p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#f2f2f2] flex items-center justify-center text-[#111827] font-bold text-xs">
                                {review.name[0]}
                            </div>
                            <div>
                                <span className="block text-sm font-bold text-[#111827]">{review.name}</span>
                                <span className="block text-xs text-[#9ca3af] font-bold uppercase tracking-widest">{review.date}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReviewsMetricsSection;
