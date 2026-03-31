import React from "react";
import { MapPin } from "lucide-react";

const COUNTRIES = [
  "Australia", "Austria", "Belgium", "Canada", "Czech Republic", "Denmark",
  "Finland", "France", "Germany", "Greece", "Hungary", "India", "Ireland",
  "Italy", "Netherlands", "Norway", "Poland", "Portugal", "Romania", "Spain",
  "Sweden", "Switzerland", "Turkey", "United Kingdom", "United States", "Other",
];

const CITIES_BY_COUNTRY = {
  Germany: [
    "Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne", "Stuttgart", "Düsseldorf",
    "Leipzig", "Dortmund", "Essen", "Bremen", "Dresden", "Hanover", "Nuremberg",
    "Duisburg", "Bochum", "Wuppertal", "Bielefeld", "Bonn", "Münster",
    "Mannheim", "Karlsruhe", "Augsburg", "Wiesbaden", "Aachen", "Heidelberg",
  ],
  Austria: ["Vienna", "Graz", "Linz", "Salzburg", "Innsbruck", "Klagenfurt"],
  Switzerland: ["Zurich", "Geneva", "Basel", "Bern", "Lausanne", "Lucerne"],
  Netherlands: ["Amsterdam", "Rotterdam", "The Hague", "Utrecht", "Eindhoven"],
  France: ["Paris", "Lyon", "Marseille", "Toulouse", "Nice", "Strasbourg"],
  "United Kingdom": ["London", "Manchester", "Birmingham", "Leeds", "Edinburgh", "Glasgow"],
};

const AddressDetails = ({ formData, handleChange }) => {
  const inputClass = "w-full bg-[#f9f9f7] border border-[#0f4c3a]/10 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#0f4c3a]/30 transition-colors text-[#111827] placeholder:text-[#9ca3af]";

  const cities = CITIES_BY_COUNTRY[formData.country] || [];
  const hasCityList = cities.length > 0;

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <MapPin size={16} className="text-[#0f4c3a]" />
        <h3 className="text-sm font-bold text-[#111827]">Current Address</h3>
      </div>
      <p className="text-[10px] text-[#9ca3af] mb-4">Where do you currently live?</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Country */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-[#4b5563]">Country <span className="text-[#EA4335]">*</span></label>
          <select
            name="country" required
            value={formData.country || ""}
            onChange={(e) => {
              handleChange(e);
              handleChange({ target: { name: 'city', value: '' } });
            }}
            className={`${inputClass} ${!formData.country ? 'text-[#9ca3af]' : 'text-[#111827]'}`}
          >
            <option value="" className="text-[#9ca3af]">Select country</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c} className="text-[#111827]">{c}</option>
            ))}
          </select>
        </div>

        {/* Row 2: City + District */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-[#4b5563]">City <span className="text-[#EA4335]">*</span></label>
          {hasCityList ? (
            <select
              name="city" required
              value={formData.city || ""}
              onChange={handleChange}
              className={`${inputClass} ${!formData.city ? 'text-[#9ca3af]' : 'text-[#111827]'}`}
            >
              <option value="" className="text-[#9ca3af]">Select city</option>
              {cities.sort().map((c) => (
                <option key={c} value={c} className="text-[#111827]">{c}</option>
              ))}
              <option value="__other" className="text-[#111827]">Other</option>
            </select>
          ) : (
            <input
              type="text" name="city" required
              value={formData.city || ""}
              onChange={handleChange}
              className={inputClass}
              placeholder="City name"
            />
          )}
          {formData.city === '__other' && hasCityList && (
            <input
              type="text" name="cityOther"
              value={formData.cityOther || ""}
              onChange={handleChange}
              className={`${inputClass} mt-2`}
              placeholder="Enter your city"
              required
            />
          )}
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-[#4b5563]">District / Area</label>
          <input
            type="text" name="district"
            value={formData.district || ""}
            onChange={handleChange}
            className={inputClass}
            placeholder={formData.city === "Berlin" ? "e.g. Mitte, Kreuzberg" : "District (optional)"}
          />
        </div>

        {/* Row 3: Zip + Street */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-[#4b5563]">Zip / Postal Code <span className="text-[#EA4335]">*</span></label>
          <input
            type="text" name="zipCode" required
            value={formData.zipCode || ""}
            onChange={handleChange}
            className={inputClass}
            placeholder={formData.country === "Germany" ? "10115" : "Postal code"}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-[#4b5563]">Street Address <span className="text-[#EA4335]">*</span></label>
          <input
            type="text" name="currentAddress" required
            value={formData.currentAddress || ""}
            onChange={handleChange}
            className={inputClass}
            placeholder="Street name and house number"
          />
        </div>

        {/* Row 4: Apartment (half width) */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-[#4b5563]">Apartment / Unit</label>
          <input
            type="text" name="apartment"
            value={formData.apartment || ""}
            onChange={handleChange}
            className={inputClass}
            placeholder="Apt, Suite, Floor (optional)"
          />
        </div>
      </div>
    </div>
  );
};

export default AddressDetails;
