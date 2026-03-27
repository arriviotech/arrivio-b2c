import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BadgeCheck } from "lucide-react";

const DescriptionSection = ({ property, onOpenModal }) => {
    const descriptionRef = useRef(null);
    const [shouldShowExpand, setShouldShowExpand] = useState(false);

    useEffect(() => {
        if (descriptionRef.current) {
            setShouldShowExpand(descriptionRef.current.scrollHeight > 140);
        }
    }, [property?.description]);

    return (
        <div id="about" className="pt-2 scroll-mt-40">
            <h3 className="font-serif text-2xl text-[#111827] mb-4 mt-4">
                About this home
            </h3>

            <motion.div
                initial={false}
                animate={{ height: shouldShowExpand ? 140 : "auto" }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="relative overflow-hidden"
            >
                <div ref={descriptionRef}>
                    <p className="text-[#1f2937] text-[14px] leading-[1.7] font-medium whitespace-pre-line tracking-tight">
                        {property.description}
                    </p>
                </div>

                {shouldShowExpand && (
                    <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-[#f2f2f2] to-transparent z-10" />
                )}
            </motion.div>

            {shouldShowExpand && (
                <button
                    onClick={onOpenModal}
                    className="mt-6 text-[#111827] font-bold text-xs uppercase tracking-[0.2em] border-b border-[#0f4c3a]/20 hover:border-[#0f4c3a] transition-all pb-1 hover:opacity-60"
                >
                    Read Full Description
                </button>
            )}

        </div>
    );
};

export default React.memo(DescriptionSection);
