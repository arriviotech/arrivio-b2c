import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin } from "lucide-react";
import { supabase } from "../../supabase/client";

const SimilarProperties = ({ currentPropertyId, city }) => {
    const [properties, setProperties] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (!city || !currentPropertyId) return;

        const fetchSimilar = async () => {
            const { data, error } = await supabase
                .from("properties")
                .select(`
                    id, name, slug, city, district, property_type, status,
                    property_photos (storage_path, is_primary, display_order)
                `)
                .eq("status", "active")
                .is("deleted_at", null)
                .eq("city", city)
                .neq("id", currentPropertyId)
                .limit(4);

            if (!error && data) {
                setProperties(data);
            }
        };

        fetchSimilar();
    }, [city, currentPropertyId]);

    if (properties.length === 0) return null;

    const getCoverImage = (photos) => {
        if (!photos || photos.length === 0) return null;
        const sorted = [...photos].sort((a, b) => a.display_order - b.display_order);
        const primary = sorted.find((p) => p.is_primary) || sorted[0];
        return primary?.storage_path;
    };

    return (
        <div id="similar" className="pt-16 border-t border-[#0f4c3a]/10 scroll-mt-40">
            <div className="flex items-center justify-between mb-8">
                <h3 className="font-serif text-2xl text-[#111827]">More in {city}</h3>
                <Link
                    to={`/search?city=${city}`}
                    className="text-xs font-bold uppercase tracking-widest text-[#6b7280] hover:text-[#111827] flex items-center gap-2 transition-colors"
                >
                    View all <ArrowLeft size={12} className="rotate-180" />
                </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {properties.map((prop) => {
                    const coverImage = getCoverImage(prop.property_photos);
                    return (
                        <div
                            key={prop.id}
                            onClick={() => navigate(`/property/${prop.slug || prop.id}`)}
                            className="group cursor-pointer"
                        >
                            <div className="aspect-[4/3] rounded-2xl bg-[#f0f0f0] overflow-hidden relative mb-3">
                                {coverImage ? (
                                    <img
                                        src={coverImage}
                                        alt={prop.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-[#0f4c3a]/5" />
                                )}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                            </div>
                            <h4 className="text-sm font-bold text-[#111827] mb-0.5 group-hover:text-[#1f2937] transition-colors truncate">
                                {prop.name}
                            </h4>
                            <p className="flex items-center gap-1 text-xs text-[#6b7280]">
                                <MapPin size={10} />
                                {prop.district ? `${prop.district}, ${prop.city}` : prop.city}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default React.memo(SimilarProperties);
