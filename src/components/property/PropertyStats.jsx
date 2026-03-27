import React from 'react';
import { Ruler, BedDouble, Bath, Layers, Sofa, Home, DoorOpen } from 'lucide-react';

const PropertyStats = ({ details, propertyType, furnishing }) => {
  if (!details) return null;

  const formatFloor = (val) => {
    if (val === null || val === undefined) return null;
    // Range like "0–4"
    if (typeof val === 'string' && val.includes('–')) {
      const [min, max] = val.split('–').map(Number);
      const fmtFloor = (n) => n === 0 ? 'Ground' : `${n}`;
      return `${fmtFloor(min)}–${fmtFloor(max)} Floor`;
    }
    const n = Number(val);
    if (n === 0) return 'Ground Floor';
    const suffix = (n % 10 === 1 && n !== 11) ? 'st' : (n % 10 === 2 && n !== 12) ? 'nd' : (n % 10 === 3 && n !== 13) ? 'rd' : 'th';
    return `${n}${suffix} Floor`;
  };

  const formatSize = (val) => {
    if (!val) return null;
    // Range like "22–35"
    if (typeof val === 'string' && val.includes('–')) return `${val} m²`;
    return `${val} m²`;
  };

  const formatFurnishing = (val) => {
    if (!val) return null;
    const low = val.toLowerCase();
    if (low === 'furnished') return 'Fully Furnished';
    if (low === 'semi-furnished') return 'Semi Furnished';
    if (low === 'unfurnished') return 'No Furnishing';
    return val;
  };

  const stats = [
    {
      icon: Home,
      label: "Type",
      value: propertyType,
      format: (v) => v ? v.charAt(0).toUpperCase() + v.slice(1) : null,
    },
    {
      icon: Ruler,
      label: "Size",
      value: details.size,
      format: (v) => formatSize(v),
    },
    {
      icon: Layers,
      label: "Floors",
      value: details.floor,
      format: (v) => formatFloor(v),
    },
    {
      icon: BedDouble,
      label: "Rooms",
      value: details.beds,
      format: (v) => v === 0 ? 'Studio' : `Up to ${v} Bedroom${v > 1 ? 's' : ''}`,
    },
    {
      icon: Sofa,
      label: "Furniture",
      value: furnishing,
      format: (v) => formatFurnishing(v),
    },
    {
      icon: DoorOpen,
      label: "Units",
      value: details.totalUnits,
      format: (v) => `${v} Unit${v > 1 ? 's' : ''}`,
    },
  ].filter(s => s.value !== undefined && s.value !== null && s.format(s.value) !== null);

  return (
    <div className="py-4 border-y border-[#0f4c3a]/5 my-2">
      <div className="grid grid-cols-2 gap-y-6 gap-x-4 md:flex md:flex-wrap md:items-center md:gap-x-4 md:gap-y-4">
        {stats.map((stat, i) => (
          <div key={i} className="flex items-center gap-2.5 relative">
            <div className="text-[#4b5563] flex items-center justify-center shrink-0">
              <stat.icon size={20} strokeWidth={1.5} />
            </div>

            <div className="flex flex-col -space-y-0.5">
              <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#9ca3af]">
                {stat.label}
              </span>
              <span className="text-sm font-bold text-[#111827] whitespace-nowrap tracking-tight">
                {stat.format(stat.value)}
              </span>
            </div>

            {i < stats.length - 1 && (
              <div className="hidden md:block h-8 w-[1px] bg-[#0f4c3a]/10 ml-2 lg:ml-4 shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropertyStats;
