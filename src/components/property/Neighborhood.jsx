import React from 'react';
import { Train, Coffee, ShoppingBag, Leaf, Navigation, Car, Bike, Plane, Map, Sparkles, Building, Waves, MapPin } from 'lucide-react';
import PropertyMap from '../search/PropertyMap'; // Import your real map

const Neighborhood = ({ property }) => {

    // Safety check: if no property data, show nothing
    if (!property) return null;

    // Simulated Hotspots Data
    const hotspots = [
        { icon: <Train size={16} />, label: "U-Bahn Station", dist: "3 min walk", type: "Transport" },
        { icon: <Coffee size={16} />, label: "Third Wave Coffee", dist: "5 min walk", type: "Lifestyle" },
        { icon: <ShoppingBag size={16} />, label: "Organic Grocery", dist: "2 min walk", type: "Essentials" },
        { icon: <Leaf size={16} />, label: "City Park", dist: "8 min walk", type: "Nature" },
    ];

    const commuteItems = [
        { icon: <Car size={16} />, hub: "Airport", time: "25 min", color: "bg-blue-50 text-blue-600" },
        { icon: <Train size={16} />, hub: "City Center", time: "15 min", color: "bg-emerald-50 text-emerald-600" },
        { icon: <Bike size={16} />, hub: "Tech Hub", time: "10 min", color: "bg-orange-50 text-orange-600" },
    ];

    return (
        <div className="relative">
            {/* HEADER & VIBE */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-12">
                <div className="lg:col-span-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
                        <h3 className="font-serif text-2xl text-[#111827]">The Neighborhood</h3>
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-[#186b53]/10 rounded-full w-fit">
                            <Sparkles size={12} className="text-[#186b53]" />
                            <span className="text-xs font-bold uppercase tracking-wider text-[#186b53] whitespace-nowrap">Premium Location</span>
                        </div>
                    </div>
                    <p className="text-base text-[#374151] leading-relaxed font-medium">
                        Located in the prestigious heart of <span className="text-[#111827] font-bold">{property.city}</span>.
                        This area is established as a premium residential enclave, offering high-end grocers, boutique wellness centers, and a quiet, professional atmosphere, perfectly suited for a seamless long-term stay.
                    </p>
                </div>

                <div className="p-6 bg-[#f7f7f7] rounded-3xl border border-[#0f4c3a]/5">
                    <span className="block text-xs font-bold uppercase tracking-widest text-[#186b53] mb-4">Neighborhood Vibe</span>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Waves size={16} className="text-[#9ca3af]" />
                            <span className="text-sm font-medium text-[#1f2937]">Quiet & Residential</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Building size={16} className="text-[#9ca3af]" />
                            <span className="text-sm font-medium text-[#1f2937]">Boutique Shopping</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Coffee size={16} className="text-[#9ca3af]" />
                            <span className="text-sm font-medium text-[#1f2937]">Cafe Culture</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* CONTENT GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 1. REAL INTERACTIVE MAP */}
                <div className="relative group">
                    <div className="h-64 lg:h-full min-h-[400px] bg-[#222] rounded-[2rem] overflow-hidden relative shadow-lg border border-[#0f4c3a]/10 z-0 transition-all duration-500 group-hover:shadow-2xl">
                        <PropertyMap
                            properties={[property]}
                            hoveredId={property.id}
                        />
                    </div>
                    <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/90 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl flex items-center justify-between pointer-events-none transform translate-y-0 opacity-100 md:translate-y-2 md:opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                        <div className="flex items-center gap-3">
                            <MapPin className="text-[#186b53]" size={18} />
                            <span className="text-sm font-bold text-[#111827]">{property.address || property.location}</span>
                        </div>
                        <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${property.lat || ''},${property.lng || ''}&destination_place_id=${encodeURIComponent(property.address || property.location || property.city)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="pointer-events-auto flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#111827] hover:text-[#186b53] transition-colors"
                        >
                            <Navigation size={12} /> Directions
                        </a>
                    </div>
                </div>

                {/* 2. LOCAL INTELLIGENCE */}
                <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-3">
                        <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#186b53] mb-2 px-1">Nearby Hotspots</h4>
                        {hotspots.map((item, index) => (
                            <div key={index} className="group flex items-center justify-between p-4 bg-white/40 border border-[#0f4c3a]/5 rounded-2xl hover:bg-white hover:shadow-md transition-all cursor-default">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-[#f2f2f2] flex items-center justify-center text-[#111827] group-hover:scale-110 transition-transform">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-[#111827]">{item.label}</h4>
                                        <span className="text-xs uppercase tracking-wider text-[#9ca3af] font-bold">{item.type}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block text-xs font-bold text-[#111827]">{item.dist}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-6 border-t border-[#0f4c3a]/5">
                        <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#186b53] mb-4 px-1">Commute Times</h4>
                        <div className="grid grid-cols-3 gap-4">
                            {commuteItems.map((item, idx) => (
                                <div key={idx} className="p-4 rounded-2xl bg-white border border-[#0f4c3a]/5 text-center group hover:border-[#0f4c3a]/10 transition-all">
                                    <div className={`w-8 h-8 rounded-full ${item.color} flex items-center justify-center mx-auto mb-3`}>
                                        {item.icon}
                                    </div>
                                    <span className="block text-xs font-bold text-[#111827] mb-1">{item.time}</span>
                                    <span className="block text-[8px] uppercase tracking-widest text-[#9ca3af] font-bold">{item.hub}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Neighborhood;

