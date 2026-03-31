import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ----------------------------------
   ARRIVIO CITY COORDINATES
---------------------------------- */

const ARRIVIO_CITIES = [
  { name: "Aachen", lat: 50.7753, lng: 6.0839 },
  { name: "Berlin", lat: 52.5200, lng: 13.4050 },
  { name: "Bonn", lat: 50.7374, lng: 7.0982 },
  { name: "Cologne", lat: 50.9375, lng: 6.9603 },
  { name: "Dusseldorf", lat: 51.2277, lng: 6.7735 },
  { name: "Frankfurt", lat: 50.1109, lng: 8.6821 },
  { name: "Hamburg", lat: 53.5511, lng: 9.9937 },
  { name: "Munich", lat: 48.1351, lng: 11.5820 },
];

/* ----------------------------------
   DISTANCE FORMULA (HAVERSINE)
---------------------------------- */

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/* ----------------------------------
   COMPONENT
---------------------------------- */

const CitySearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  /* ----------------------------------
     SEARCH PLACE → LAT/LNG
  ---------------------------------- */

  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      return;
    }

    const delay = setTimeout(async () => {
      setLoading(true);

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${query}`
        );
        const data = await res.json();

        if (!data.length) {
          setResults([]);
          setLoading(false);
          return;
        }

        const { lat, lon } = data[0];

        const nearby = ARRIVIO_CITIES.map((city) => {
          const km = getDistance(
            parseFloat(lat),
            parseFloat(lon),
            city.lat,
            city.lng
          );

          return {
            ...city,
            km: km.toFixed(1),
            miles: (km * 0.621371).toFixed(1),
          };
        }).sort((a, b) => a.km - b.km);

        setResults(nearby);
      } catch (err) {
        console.error(err);
      }

      setLoading(false);
    }, 600);

    return () => clearTimeout(delay);
  }, [query]);

  return (
    <div className="relative w-full max-w-xl mt-6">
      {/* SEARCH INPUT */}
      <div className="flex items-center bg-white/70 backdrop-blur-md border border-black/10 rounded-full px-5 py-3 shadow-sm">
        <MapPin size={18} className="text-[#111827] mr-3" />
        <input
          type="text"
          placeholder="Search a street, area or city..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-transparent outline-none text-sm text-[#1A1A1A]"
        />
      </div>

      {/* FLOATING PANEL */}
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute mt-3 w-full bg-white rounded-2xl shadow-xl overflow-hidden z-30"
          >
            {results.map((city) => (
              <div
                key={city.name}
                onClick={() =>
                  navigate("/search", {
                    state: { location: city.name },
                  })
                }
                className="flex justify-between items-center px-5 py-4 hover:bg-[#F5F4F2] cursor-pointer transition"
              >
                <div>
                  <p className="font-serif text-[#111827]">
                    {city.name}
                  </p>
                  <p className="text-xs text-black/50">
                    Approx. {city.km} km • {city.miles} mi
                  </p>
                </div>

                <span className="text-xs uppercase tracking-widest text-[#D4A017] font-bold">
                  View
                </span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {loading && (
        <p className="text-xs text-black/40 mt-2 text-center">
          Finding nearby cities...
        </p>
      )}
    </div>
  );
};

export default CitySearch;
